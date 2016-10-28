#include "n2view.h"
#include <grace/process.h>
#include <grace/timestamp.h>
#include <grace/system.h>
#include <zlib.h>

GroupCache::GroupCache (void)
{
    acquire();
}

GroupCache::~GroupCache (void)
{
}

void GroupCache::run (void)
{
    while (true)
    {
        acquire();
        sleep (10);
    }
}

value *GroupCache::get (void)
{
    returnclass (value) res retain;
    sharedsection (data)
    {
        res = data;
    }
    return &res;
}

void GroupCache::acquire (void)
{
	string groupjson;
	value groups;
	string cmd = "/usr/bin/n2groups -j";
	
	systemprocess pgroups (cmd);
	pgroups.run ();
	while (! pgroups.eof())
	{
		groupjson += pgroups.read (4096);
	}
	pgroups.serialize ();
	groups.fromjson (groupjson);
    exclusivesection (data)
    {
        data = groups;
    }
}

// ==========================================================================
// CONSTRUCTOR RESTView
// ==========================================================================
RESTView::RESTView (N2ViewApp *papp, LabelResolver &r)
	: httpdobject (papp->httpServer, "/n2/host/*"), resolver (r)
{
	string scripts;
	if (fs.exists ("tmpl:analyze.thtml")) scripts = fs.load ("tmpl:analyze.thtml");
	if (fs.exists ("/etc/n2/analyze.thtml"))
	{
		scripts.strcat (fs.load ("/etc/n2/analyze.thtml"));
	}
	tmpl.build (scripts);
	hostschema.load ("schema:n2host.schema.xml");
	groupschema.load ("schema:n2groups.schema.xml");
	groupcache.spawn();
}

// ==========================================================================
// DESTRUCTOR RESTView
// ==========================================================================
RESTView::~RESTView (void)
{
}

// ==========================================================================
// METHOD RESTView::getOverview
// ==========================================================================
string *RESTView::getOverview (value &env)
{
	value res;
	string groupjson;
	value groups, labels;
	string cmd = "/usr/bin/n2groups -j";
	
#ifdef PERFTEST
	fout.writeln ("-->1");
#endif

	systemprocess pgroups (cmd);
	pgroups.run ();
	while (! pgroups.eof())
	{
		groupjson += pgroups.read (4096);
	}
	pgroups.serialize ();
	groups.fromjson (groupjson);
	
#ifdef PERFTEST
	fout.writeln ("-->2");
#endif

	value allowedips;
	
	// Copy the ip limit out of the session.
	if (env["limit"].count())
	{
		foreach (lim, env["limit"])
		{
			allowedips[lim.sval()] = true;
		}
	}

#ifdef PERFTEST
	fout.writeln ("-->3");
#endif

	file f;
	f.openread ("/var/state/n2/n2labels");
	while (! f.eof())
	{
		string ln = f.gets ();
		string lab = ln.cutat (':');
		
		if (lab.strlen()) labels[ln] = lab;
	}
	
	f.close();

#ifdef PERFTEST
	fout.writeln ("-->4");
#endif

	foreach (group, groups)
	{
		foreach (member, group["members"])
		{
			string label = labels[member.id()];
			if (! label)
			{
				label = getLabel (member.id());
				if (! label) label = member.id();
			}
			
			if (allowedips.count() && (! allowedips.exists (member.id())))
				continue;
			
			res.newval() = $("group",group.id())->
						   $("groupDescription",group["description"])->
						   $("id",member.id())->
						   $("label",label)->
						   $("status",member["status"])->
						   $("statusFlags",member["flags"])->
						   $("cpuUsage",member["cpu"].dval())->
						   $("loadAverage",member["loadavg"].dval())->
						   $("roundTripTime",member["rtt"].dval())->
						   $("diskIO",member["diskio"].ival())->
						   $("networkIn",member["netin"].ival())->
						   $("networkOut",member["netout"].ival());
		}
	}
	
#ifdef PERFTEST
	fout.writeln ("-->5");
#endif
	return res.tojson();
}

// ==========================================================================
// METHOD RESTView::getHostStats
// ==========================================================================
value *RESTView::getHostStats (const string &host, const string &timespec)
{
	returnclass (value) res retain;

	string tspec = timespec.filter ("0123456789");
	if (tspec && tspec.strlen() != 12) return NULL;
	
	string pdate = tspec.left (8);
	string ptime = "%s:%s" %format (tspec.mid (8,2),tspec.mid(10,2));
	
	string recordtime = timespec.left (16);
	
	if (! recordtime)
	{
		timestamp ts = core.time.now();
		recordtime = ts.iso().left (16);
	}
	
	string cmd = "/usr/bin/n2hstat -x %P" %format (host);
	if (pdate.strlen()) cmd.strcat (" %s %s" %format (ptime,pdate));

	string hostxml;
	
	systemprocess phstat (cmd);
	phstat.run ();
	while (! phstat.eof ())
	{
		hostxml.strcat (phstat.read (4096));
	}
	phstat.serialize ();
	res.fromxml (hostxml, hostschema);
	res["recordTime"] = recordtime;
	return &res;
}

// ==========================================================================
// METHOD RESTView::getDetails
// ==========================================================================
string *RESTView::getDetails (const string &host, const string &timespec)
{
	value res;
	value hstat = getHostStats (host, timespec);
	processHStat (hstat, res);
	res["hostLabel"] = resolver.resolve (host);
	return res.tojson();
}

// ==========================================================================
// METHOD RESTView::getLog
// ==========================================================================
string *RESTView::getLog (const string &host)
{
	value hstat = getHostStats (host);
	value res;
	value &entries = res["eventLog"];
	
	foreach (line, hstat["events"])
	{
		value problems;
		if (line("flagged").sval())
		{
			problems = strutil::split (line("flagged"), ",");
		}
		entries.newval() =
			$("timeStamp",line("ts"))->
			$("status",line("newstatus"))->
			$("problems",problems)->
			$("text",line.sval());
	}
	return res.tojson();
}

// ==========================================================================
// METHOD RESTView::getAnalysis
// ==========================================================================
string *RESTView::getAnalysis (const string &host)
{
	returnclass (string) out retain;
	
	value senv;
	string cmd = "/usr/bin/n2analyze %s" %format (host);
	string anaxml;
	systemprocess pana (cmd);
	pana.run ();
	while (! pana.eof ())
	{
		anaxml.strcat (pana.read (4096));
	}
	pana.serialize ();

	// Parse the XML into a value object.	
	value analysis;
	analysis.fromxml (anaxml);
	
	bool anythingtoreport = false;
	foreach (n, analysis)
	{
		statstring key = "report_%s" %format (n.id());
		if (n.bval()) anythingtoreport = true;
		senv[key] = n;
	}
	senv["anythingtoreport"] = anythingtoreport;
	tmpl.run (senv, out, "analysis");
	return &out;
}

// ==========================================================================
// METHOD RESTView::processHStat
// ==========================================================================
void RESTView::processHStat (const value &hstat, value &senv)
{
	value keyTranslations =
		$("cpu","cpuUsage")->
		$("diskio","diskActivity")->
		$("iowait","ioWaitPercent")->
		$("hardware","hardwarePlatform")->
		$("loadavg","loadAverage")->
		$("loss","packetLoss")->
		$("netin","networkIn")->
		$("netout","networkOut")->
		$("os","operatingSystem")->
		$("processcount","numberOfProcesses")->
		$("rtt","roundTripTime")->
		$("swap","freeSwapMemory")->
		$("ram","freeRAM")->
		$("mounts","mountedFilesystems")->
		$("services","runningServices")->
		$("processes","processList")->
		$("ports","networkPorts")->
		$("ttys","consoleSessions")->
		$("http","virtualHosts")->
		$("xenvps","virtualMachines");
		
		
	value floatkeys = $("loadavg",true)->
					  $("rtt",true)->
					  $("swap",true)->
					  $("ram",true)->
					  $("loss",true)->
					  $("cpu",true);
		
	// Go over the XML, copy all direct values that have no children.
	foreach (node, hstat)
	{
		if (! node.count())
		{
			statstring id = node.id();
			if (keyTranslations.exists (id))
			{
				id = keyTranslations[id];
			}
			if (floatkeys.exists (node.id()))
			{
				senv[id] = node.dval();
			}
			else
			{
				senv[id] = node;
			}
		}
	}
	
    value problems;
    foreach (f, hstat["flags"])
    {
    	if (f.id() == "other") continue;
    	if (f.ival()) problems.newval() = f.id();
    }
    
    
    if (problems.count())
    {
	    senv["problems"] = problems;
    }
    senv["numberOfProcesses"] = hstat["processcount"].ival();
	senv["numberOfRunningProcesses"] = hstat["processcount"]("running").ival();

	// Go over the mounts, if there are any
	if (hstat["mounts"].count())
	{
		foreach (mount, hstat["mounts"])
		{
			// Create @loop node for the script
			senv["mountedFilesystems"].newval() =
				$("mountPoint", mount.sval()) ->
				$("diskSize", mount("size").ival())->
				$("filesystemType", mount("fstype"))->
				$("usage", mount("usage").dval());
		}
	}
	
	if (hstat["services"].count())
	{
		senv["runningServices"] = hstat["services"];
	}
	
	// Go over the processes, if there are any
	if (hstat["processes"].count())
	{
		foreach (proc, hstat["processes"])
		{
			senv["processList"][proc.id()] =
				$("name", proc.sval()) ->
				$("user", proc("user").sval())->
				$("memoryUsage",proc("memusage").dval())->
				$("cpuUsage",proc("usage").dval());
		}
	}
	
	// Dito, ports.
	if (hstat["ports"].count())
	{
		foreach (port, hstat["ports"])
		{
			senv["networkPorts"][port.id()] =
				$("connectedState",port("connected").ival())->
				$("otherState",port("other").ival());
		}
	}
	
	// Dito, ttys.
	if (hstat["ttys"].count())
	{
		foreach (tty, hstat["ttys"])
		{
			senv["consoleSessions"][tty.id()] =
				$("remoteHost", tty("host"))->
				$("userName", tty("username"));
		}
	}
	
	// Ditto, http vhosts.
	if (hstat["http"].count())
	{
		foreach (vhost, hstat["http"])
		{
			senv["virtualHosts"][vhost.id()]["count"] = vhost;
		}
	}
	
	
	// Dito, zero1 xen vps instances.
	if (hstat["xenvps"].count())
	{
		foreach (vps, hstat["xenvps"])
		{
			senv["virtualMachines"][vps.id()] =
				$("cpuUsage",vps("cpu").dval())->
				$("ioUsage",vps("iops").ival())->
				$("memory",vps("mem").ival());
		}
	}
	
	// Format the uptime for human consumption.
	int iuptime = hstat["uptime"];
	int updays = iuptime/86400;
	iuptime = iuptime%86400;
	int uphours = iuptime/3600;
	iuptime = iuptime%3600;
	int upmins = iuptime/60;
	iuptime = iuptime %60;
	
	if (updays)
	{
		if (iuptime)
		{
			senv["uptimeString"] = "%i days, %i:%02i:%02i"
								%format (updays,uphours,upmins,iuptime);
		}
		else if (upmins)
		{
			senv["uptimeString"] = "%i days, %i:%02i"
								%format (updays,uphours,upmins);
		}
		else
		{
			senv["uptimeString"] = "%i days, %i hours" %format (updays,uphours);
		}
			
	}
	else
	{
		senv["uptimeString"] = "%02i:%02i" %format (uphours,upmins);
	}
	
}

// ==========================================================================
// METHOD RESTView::getGraph
// ==========================================================================
string *RESTView::getGraph (const string &ip, const string &graphtype,
							const string &timespec, int interval)
{
	value msr = $("netin", 0) ->
				$("netout", 0) ->
				$("load", 0) ->
				$("cpu", 0) ->
				$("diskio", 0) ->
				$("ram", 0) ->
				$("swap", 0) ->
				$("rtt", 0) ->
				$("totalmem", 0) ->
				$("nproc", 0) ->
				$("iowait", 0);
				
	if (! msr.exists (graphtype)) return NULL;
	
	string tspec = timespec.filter ("0123456789");
	if (tspec && tspec.strlen() != 12) return NULL;
	
	string pdate = tspec.left (8);
	string ptime = "%s:%s" %format (tspec.mid (8,2),tspec.mid(10,2));

	value res;
	string cmd = "/usr/bin/n2rawdat %P %s %i" %format (ip, graphtype, interval/320);
	if (tspec)
	{
		cmd.strcat (" %s %s" %format (ptime, pdate));
	}
	
	
	
	systemprocess praw (cmd);
	praw.run();
	
	string line = praw.gets();
	double max = atof (line.str());
	res["max"] = max;
	
	while (! praw.eof())
	{
		line = praw.gets();
		if (line.strlen())
		{
			res["data"].newval() = ((line.toint()*max)/128);
		}
	}
	praw.serialize ();
	return res.tojson();
}

// ==========================================================================
// METHOD RESTView::run
// ==========================================================================
int RESTView::run (string &uri, string &postbody, value &inhdr,
				   string &out, value &outhdr, value &env, tcpsocket &s)
{
	string resturi = uri.copyafter ("/n2/host/");
	value splt = strutil::split (resturi, '/');
	string ip = splt[0].sval().filter("0123456789.");
	outhdr["Cache-control"] = "max-age=20";
	
	time_t t_now = kernel.time.now();
	timestamp ts = t_now;
	string dt = ts.format ("%a, %e %b %Y %H:%M:%S GMT");
	outhdr["Date"] = dt;
	outhdr["Last-Modified"] = dt;
	ts = (t_now+1);
	dt = ts.format ("%a, %e %b %Y %H:%M:%S GMT");
	outhdr["Expires"] = dt;
	
	if (! env.exists ("sessionid"))
	{
		return 403;
	}
	
	outhdr["Content-type"] = "application/json";
	
	if (! ip)
	{
		out = getOverview (env);
	}
	else
	{
		value allowedips;
		
		// Copy the ip limit out of the session.
		if (env["limit"].count())
		{
			foreach (lim, env["limit"])
			{
				allowedips[lim.sval()] = true;
			}
		}
		
		if (allowedips.count() && (! allowedips.exists (ip))) return 404;
		
		enum requesttypes {
			DETAILS,
			GRAPH,
			REPORT,
			EVENTLOG,
			ANALYSIS } reqtype = DETAILS;
			
		string tspec;
		string graphtype;
		int interval = 1500;
		
		for (int i=1; i<splt.count(); i+= 2)
		{
			statstring key = splt[i];
			string val = splt[i+1];
			
			caseselector (key)
			{
				incaseof ("graph") :
					reqtype = GRAPH;
					graphtype = val;
					break;
				
				incaseof ("report") :
					reqtype = ANALYSIS;
					i = splt.count();
					break;
				
				incaseof ("interval") :
					interval = val.toint (10);
					break;
				
				incaseof ("eventlog") :
					reqtype = EVENTLOG;
					i = splt.count();
					break;
					
				incaseof ("analysis") :
					reqtype = ANALYSIS;
					i = splt.count();
					break;
				
				incaseof ("date") :
					tspec = val;
					break;
				
				defaultcase :
					break;
			}
		}
		
		value tval;
		
		switch (reqtype)
		{
			case DETAILS:
				out = getDetails (ip, tspec);
				break;
			
			case EVENTLOG:
				out = getLog (ip);
				break;
			
			case GRAPH:
				out = getGraph (ip, graphtype, tspec, interval);
				break;
			
			case ANALYSIS:
				tval["html"] = getAnalysis (ip);
				out = tval.tojson();
				break;
			
			default:
				return 404;
		}
	}
	
	return 200;
}

// ==========================================================================
// METHOD RESTView::getLabel
// ==========================================================================
string *RESTView::getLabel (const string &addr)
{
	return resolver.resolve (addr);
}

// ==========================================================================
// CONSTRUCTOR UserView
// ==========================================================================
UserView::UserView (N2ViewApp *papp)
	: httpdobject (papp->httpServer, "/n2/user/*")
{
}

// ==========================================================================
// DESTRUCTOR UserView
// ==========================================================================
UserView::~UserView (void)
{
}

// ==========================================================================
// METHOD UserView::run
// ==========================================================================
int UserView::run (string &uri, string &postbody, value &inhdr,
				   string &out, value &outhdr, value &env,
				   tcpsocket &s)
{
	if (! env.exists ("sessionid"))
	{
		return 403;
	}
	
	value outjson;
	string uname = uri.copyafter ("/n2/user/");
	if (env["username"].sval() != uname) return 404;
	
	if (env["method"] == "GET")
	{
		outjson = $("id",uname)->
				  $("username",uname)->
				  $("isAdmin",env["limit"].count() == 0);
		out = outjson.tojson();
		outhdr["Content-type"] = "application/json";
		return 200;
	}
	
	return 500;
}

// ==========================================================================
// CONSTRUCTOR SessionView
// ==========================================================================
SessionView::SessionView (N2ViewApp *papp)
	: httpdobject (papp->httpServer, "/n2/session*"), app (*papp),
	  pw ("/etc/n2/n2view.passwd","limit")
{
}

// ==========================================================================
// DESTRUCTOR SessionView
// ==========================================================================
SessionView::~SessionView (void)
{
}

// ==========================================================================
// METHOD SessionView::handleLogin
// ==========================================================================
int SessionView::handleLogin (const value &args, string &out, value &outhdr)
{
	value iplist;
	string username = args["username"];
	
	if (! pw.authenticate (username, args["password"], "/"))
	{
		log::write (log::info, "auth", "Authentication failed for "
					"user %[username]s from %[ip]s" %format (args));
		out = "\"Authentication failed\"";
		return 403;
	}
	
	value userdat = pw.getuser (username);
	string limit = userdat["limit"];
	if (limit) iplist = strutil::split (limit, ',');
	if (iplist.count())
	{
		N2Util::findMonitoredHosts (iplist);
		if (! iplist.count())
		{
			log::write (log::info, "auth", "Login rejected for empty "
						"user %[username]s from %[ip]s" %format (args));
			out = "\"No objects\"";
			return 403;
		}
	}
	
	statstring sid = app.sessionDB.createSession (username, iplist);
	value sv = app.sessionDB.get (sid);
	sv["sessionid"] = sid;
	out = sv.tojson();
	
	outhdr["Set-Cookie"] = "N2SESSID=%s; Path=/" %format (sid);
	
	log::write (log::info, "auth", "Login user %[username]s ip %[ip]s "
				"with id %{1}s" %format (args, sid));
	
	return 201;
}

// ==========================================================================
// METHOD SessionView::run
// ==========================================================================
int SessionView::run (string &uri, string &postbody, value &inhdr,
					  string &out, value &outhdr, value &env,
					  tcpsocket &s)
{
	value args;
	if (inhdr["Content-type"] == "application/json")
	{
		args.fromjson (postbody);
	}
	else
	{
		args = strutil::httpurldecode (postbody);
	}
	
	args["ip"] = env["ip"];
	
	if (uri == "/n2/session" || uri == "/n2/session/")
	{
		outhdr["Content-type"] = "application/json";
		return handleLogin (args, out, outhdr);
	}
	
	string id = uri.copyafterlast ('/');

	if (env["method"] == "DELETE")
	{
		app.sessionDB.dropSession (id);
		out = "OK";
		return 200;
	}
	
	if (! app.sessionDB.exists (id))
	{
		out = "?";
		return 404;
	}
	
	if (env["method"] != "GET")
	{
		out = "?";
		return 405;
	}
	
	value sess = app.sessionDB.get (id);
	outhdr["Content-type"] = "application/json";
	out = sess.tojson();
	return 200;
}
