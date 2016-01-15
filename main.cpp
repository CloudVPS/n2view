#include "n2view.h"
#include <grace/process.h>
#include <grace/timestamp.h>
#include <grace/system.h>
#include <grace/tcpsocket.h>
#include <grace/http.h>
#include <grace/xmlschema.h>

#define DOCROOT "library:n2view/docroot"
#define APPID "net.xl-is.svc.n2view"
#define SERVERPORT 1889

// ==========================================================================
// PROJECT METADATA
// ==========================================================================
$appobject(N2ViewApp);
$version(1.0.6);

// ==========================================================================
// CONSTRUCTOR N2ViewApp
// ==========================================================================
N2ViewApp::N2ViewApp (void)
	: daemon (APPID),
	  conf (this),
	  sessionDB (this)
{
	opt = $("-d", $("long", "--debug")) ->
		  $("--debug", $("argc", 0));
}

// ==========================================================================
// DESTRUCTOR N2ViewApp
// ==========================================================================
N2ViewApp::~N2ViewApp (void)
{
}

// ==========================================================================
// METHOD N2ViewApp::main
// ==========================================================================
int N2ViewApp::main (void)
{
	string conferr; ///< Error return from configuration class.
	
	if (argv.exists ("--debug")) setforeground ();
	else
	{
		// Switch to N2 user
		if (! settargetuser ("n2"))
		{
			ferr.printf ("Could not resolve n2 user\n");
			return 1;
		}
	}
	
	// Add watcher value for event log. System will daemonize after
	// configuration was validated.
	conf.addwatcher ("system/eventlog", &N2ViewApp::confLog);
	
	// Load will fail if watchers did not valiate.
	if (! conf.load ("net.xl-is.svc.n2view", conferr))
	{
		ferr.printf ("%% Error loading configuration: %s\n", conferr.str());
		return 1;
	}
	
	LabelResolver labelResolver;
	sessionDB.init ();
	
	(void)			new PathFixer (this);
	(void)			new TokenAuthView (this);
	(void)			new PingView (this);
	RESTView *rv =	new RESTView (this, labelResolver);
	(void)			new SessionView (this);
	(void)			new UserView (this);
	(void)			new XMLStatsView (this);
	(void)			new httpdfileshare (httpServer, "*", DOCROOT);

#ifdef PERFTEST
	setforeground();
#endif	
	daemonize();
	log (log::info, "main", "Daemonized");
#ifdef PERFTEST
	value tenv;
	fout.writeln (rv->getOverview (tenv));
	stoplog();
	return 0;
#else
	httpServer.listento (SERVERPORT);
	httpServer.minthreads (6);
	httpServer.maxthreads (32);
	httpServer.start();
	sessionDB.spawn();
	labelResolver.spawn();
	
	log (log::info, "main", "Running");
	
	while (true)
	{
		value ev = waitevent();
		if (ev.type() == "shutdown") break;
	}
	
	log (log::info, "main", "Shutting down");
	stoplog();
	httpServer.shutdown();
	labelResolver.shutdown();
	return 0;
#endif
}

// ==========================================================================
// METHOD N2ViewApp::confLog
// ==========================================================================
bool N2ViewApp::confLog (config::action act, keypath &kp,
						 const value &nval, const value &oval)
{
	string tstr;
	
	switch (act)
	{
		case config::isvalid:
			// Check if the path for the event log exists.
			tstr = strutil::makepath (nval.sval());
			if (! tstr.strlen()) return true;
			if (! fs.exists (tstr))
			{
				ferr.printf ("%% Event log path %s does not exist",
							 tstr.str());
				return false;
			}
			return true;
			
		case config::create:
			// Set the event log target and daemonize.
			fout.printf ("%% Event log: %s\n\n", nval.cval());
			addlogtarget (log::file, nval.sval(), 0xff, 1024*1024);
			return true;
	}
	
	return false;
}

// ==========================================================================
// FUNCTION N2Util::setExpires
// ==========================================================================
void N2Util::setExpires (value &into, const string &fn, int timeout)
{
	time_t t_lastmod;
	time_t t_now = kernel.time.now ();
	time_t t_expires = t_now + timeout;
	timestamp ts;
	value v;
	
	into["Cache-control"] = "max-age=%i" %format (timeout);
	v = fs.getinfo (fn);
	t_lastmod = v["mtime"].uval();
	ts = t_lastmod;
	into["Last-Modified"] = ts.format ("%a, %e %b %Y %H:%M:%S GMT");
	ts = t_now;
	into["Date"] = ts.format ("%a, %e %b %Y %H:%M:%S GMT");
	ts = t_expires;
	into["Expires"] = ts.format ("%a, %e %b %Y %H:%M:%S GMT");
}

// ==========================================================================
// METHOD N2Util::findMonitoredHosts
// ==========================================================================
void N2Util::findMonitoredHosts (value &iplist)
{
	for (int i=iplist.count()-1; i>=0; --i)
	{
		string fn = "/var/state/n2/current/%s" %format (iplist[i]);
		if (! fs.exists (fn)) iplist.rmindex (i);
	}
}

// ==========================================================================
// CONSTRUCTOR TokenAuthView
// ==========================================================================
TokenAuthView::TokenAuthView (N2ViewApp *papp)
	: httpdobject (papp->httpServer, "/n2/coreauth/*"), app (*papp)
{
}

// ==========================================================================
// DESTRUCTOR TokenAuthView
// ==========================================================================
TokenAuthView::~TokenAuthView (void)
{
}

// ==========================================================================
// METHOD TokenAuthView::run
// ==========================================================================
int TokenAuthView::run (string &uri, string &postbody, value &inhdr,
					    string &out, value &outhdr, value &env, tcpsocket &ts)
{
	value iplist;
	string sessiontoken = uri.copyafterlast ('/');
	sessiontoken = sessiontoken.filter (filterclass::base64);

	string cmd = "/usr/sbin/n2-tokenauth %s" %format (sessiontoken);
	
	if (! fs.exists ("/usr/sbin/n2-tokenauth"))
	{
		log::write (log::error, "tokenauth", "Could not find n2-tokenauth");
		outhdr["Location"] = "/n2/login";
		return 302;
	}
	
	string userid;
	systemprocess Pauth (cmd, false);
	Pauth.run ();
	
	if (! Pauth.eof()) userid = Pauth.gets();
	while (! Pauth.eof())
	{
		string ln = Pauth.gets();
		if (ln) iplist.newval() = ln;
	}
	Pauth.close ();
	Pauth.serialize ();
	
	N2Util::findMonitoredHosts (iplist);
	
	if (! iplist.count())
	{
		log::write (log::error, "tokenauth", "User has no IPs");
		outhdr["Location"] = "/n2/noips.html";
		return 302;
	}
	
	value sdata = $("username", userid) ->
				  $("limit", iplist);
				  
	statstring sessionid = app.sessionDB.createSession (sdata);

	log::write (log::info, "tokenauth", "Authenticated user <%s> from "
				"external token <%s> with session <%s> from <%P>"
				%format (userid, sessiontoken, sessionid, env["ip"]));

	outhdr["Set-Cookie"] = "N2SESSID=%s; Path=/" %format (sessionid);
	outhdr["Location"] = "/n2/";
	out = "<html/>";
	return 302;
}

// ==========================================================================
// CONSTRUCTOR PingView
// ==========================================================================
PingView::PingView (N2ViewApp *papp)
	: httpdobject (papp->httpServer, "/n2/ping")
{
}

// ==========================================================================
// DESTRUCTOR PingView
// ==========================================================================
PingView::~PingView (void)
{
}

// ==========================================================================
// METHOD PingView::run
// ==========================================================================
int PingView::run (string &uri, string &postbody, value &inhdr,
				   string &out, value &outhdr, value &env,
				   tcpsocket &s)
{
	if (! env.exists ("sessionid")) return 403;
	out = "pong";
	return 200;
}

// ==========================================================================
// CONSTRUCTOR XMLStatsView
// ==========================================================================
XMLStatsView::XMLStatsView (N2ViewApp *papp)
	: httpdobject (papp->httpServer, "/n2/hostxml")
{
}

// ==========================================================================
// DESTRUCTOR XMLStatsView
// ==========================================================================
XMLStatsView::~XMLStatsView (void)
{
}

// ==========================================================================
// METHOD XMLStatsView::run
// ==========================================================================
int XMLStatsView::run (string &uri, string &postbody, value &inhdr,
					   string &out, value &outhdr, value &env,
					   tcpsocket &s)
{
	string cmd = "/usr/bin/n2hstat -x %s" %format (env["ip"]);
	systemprocess phstat (cmd);
	phstat.run ();
	while (! phstat.eof())
	{
		out.strcat (phstat.read (4096));
	}
	phstat.serialize ();
	outhdr["Content-type"] = "application/xml";
	return 200;
}

// ==========================================================================
// CONSTRUCTOR PathFixer
// ==========================================================================
PathFixer::PathFixer (N2ViewApp *papp) : httpdobject (papp->httpServer, "*"),
										 app (*papp)
{
}

// ==========================================================================
// DESTRUCTOR PathFixer
// ==========================================================================
PathFixer::~PathFixer (void)
{
}

// ==========================================================================
// METHOD PathFixer::run
// ==========================================================================
int PathFixer::run (string &uri, string &postbody, value &inhdr,
					string &out, value &outhdr, value &env,
					tcpsocket &s)
{
	if (env["ip"] == app.conf["system"]["proxysrc"])
	{
		env["ip"] = inhdr["X-Forwarded-For"];
	}

	if (uri == "/n2")
	{
		outhdr["Location"] = "/n2/";
		return 302;
	}
	
	if (uri.strncmp ("/n2/", 4) == 0)
	{
		return 0;
	}
	
	outhdr["Location"] = "/n2%s" %format (uri);
	out = "<html><body><a href=\"/n2%s\">redirect</a>"
		  "</body></html>" %format (uri);
	return 302;
}

// ==========================================================================
// CONSTRUCTOR CookieCutter
// ==========================================================================
CookieCutter::CookieCutter (class SessionDB *psdb, N2ViewApp &papp)
	: httpdobject (papp.httpServer, "*"), app (papp), sessionDB (*psdb)
{
}

// ==========================================================================
// DESTRUCTOR CookieCutter
// ==========================================================================
CookieCutter::~CookieCutter (void)
{
}

// ==========================================================================
// METHOD CookieCutter::run
// ==========================================================================
int CookieCutter::run (string &uri, string &postbody, value &inhdr,
					   string &out, value &outhdr, value &env,
					   tcpsocket &s)
{
	// Check for a cookie-header containing an N2SESSID value
	string ck = inhdr["Cookie"];
	if (ck.strstr ("N2SESSID=") < 0)
	{
		if (uri == "/n2/logout")
		{
			outhdr["Location"] = "/";
			return 302;
		}
		return 0;
	}
	
	// Extract the session-id the lazy way, or bail out.
	string sid = strutil::regexp (ck, "s/.*N2SESSID=//;s/ ?\\;.*//");
	
	if ((! sid) || (! sessionDB.exists (sid)))
	{
		if (uri == "/n2/logout")
		{
			outhdr["Location"] = "/";
			return 302;
		}
		return 0;
	}
	
	if (uri == "/n2/logout")
	{
		value sdat = sessionDB.get (sid);
		sessionDB.dropSession (sid);
		if (sdat.exists ("menu"))
		{
			outhdr["Location"] = "/?logout=1";
		}
		else
		{
			outhdr["Location"] = "/n2/login";
		}
		return 302;
	}
	
	// Copy session data to environment
	env["sessionid"] = sid;
	env << sessionDB.get (sid);
	
	// Fall through to next httpdobject.
	return 0;
}

// ==========================================================================
// CONSTRUCTOR SessionDB
// ==========================================================================
SessionDB::SessionDB (N2ViewApp *papp)
	: app (*papp)
{
	cut = NULL;
}

// ==========================================================================
// DESTRUCTOR SessionDB
// ==========================================================================
SessionDB::~SessionDB (void)
{
}

// ==========================================================================
// METHOD SessionDB::init
// ==========================================================================
void SessionDB::init (void)
{
	cut = new CookieCutter (this, app);
}

// ==========================================================================
// METHOD SessionDB::createSession
// ==========================================================================
statstring *SessionDB::createSession (const string &user, const value &limit)
{
	returnclass (statstring) res retain;
	value sdat = $("username", user) ->
				 $("limit", limit);
	
	res = sessions.create (sdat);
	return &res;
}

statstring *SessionDB::createSession (const value &sessdat)
{
	returnclass (statstring) res retain;
	res = sessions.create (sessdat);
	return &res;
}

// ==========================================================================
// METHOD SessionDB::dropSession
// ==========================================================================
void SessionDB::dropSession (const statstring &id)
{
	sessions.destroy (id);
}

// ==========================================================================
// METHOD SessionDB::get
// ==========================================================================
value *SessionDB::get (const statstring &id)
{
	return sessions.get (id);
}

// ==========================================================================
// METHOD SessionDB::set
// ==========================================================================
void SessionDB::set (const statstring &id, const value &nval)
{
	sessions.set (id, nval);
}

// ==========================================================================
// METHOD SessionDB::set
// ==========================================================================
void SessionDB::set (const statstring &id, const statstring &name,
					 const value &val)
{
	value nval = sessions.get (id);
	nval[name] = val;
	sessions.set (id, nval);
}

// ==========================================================================
// METHOD SessionDB::exists
// ==========================================================================
bool SessionDB::exists (const statstring &id)
{
	return sessions.exists (id);
}

// ==========================================================================
// METHOD SessionDB::run
// ==========================================================================
void SessionDB::run (void)
{
	while (true)
	{
		sleep (30);
		sessions.expire (300);
	}
}

