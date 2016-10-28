#ifndef _n2view_H
#define _n2view_H 1
#include <grace/daemon.h>
#include <grace/configdb.h>
#include <grace/httpd.h>
#include <grace/scriptparser.h>
#include <grace/session.h>
#include "resolver.h"

//  -------------------------------------------------------------------------
/// Implementation template for application config.
//  -------------------------------------------------------------------------
typedef configdb<class N2ViewApp> AppConfig;

//  -------------------------------------------------------------------------
/// Collection class for user session data.
//  -------------------------------------------------------------------------
class SessionDB : public thread
{
public:
						 SessionDB (class N2ViewApp *papp);
						~SessionDB (void);

	void				 init (void);
	statstring			*createSession (const string &user, const value &lim);
	statstring			*createSession (const value &sessdata);
	
	void				 dropSession (const statstring &id);
	value				*get (const statstring &id);
	void				 set (const statstring &id, const value &all);
	void				 set (const statstring &id, const statstring &key,
							  const value &v);
	bool				 exists (const statstring &id);
	
	void				 run (void);

protected:
	sessionlist			 sessions;
	class N2ViewApp		&app;
	class CookieCutter	*cut;
};

//  -------------------------------------------------------------------------
/// Static utility class
//  -------------------------------------------------------------------------
class N2Util
{
public:
	static void setExpires (value &into, const string &fn, int timeout);
	static void findMonitoredHosts (value &iplist);
};

//  -------------------------------------------------------------------------
/// Main daemon class.
//  -------------------------------------------------------------------------
class N2ViewApp : public daemon
{
public:
		 				 N2ViewApp (void);
		 				~N2ViewApp (void);
		 	
	int					 main (void);
	
	httpd				 httpServer;
	SessionDB			 sessionDB;
	AppConfig			 conf;

protected:
	bool				 confLog (config::action act, keypath &path,
								  const value &nval, const value &oval);
};

//  -------------------------------------------------------------------------
/// Handles the application base-path (/n2/) 
//  -------------------------------------------------------------------------
class PathFixer : public httpdobject
{
public:
						 PathFixer (N2ViewApp *papp);
						~PathFixer (void);
	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
							  
protected:
	N2ViewApp			&app;
};

//  -------------------------------------------------------------------------
/// Handles single sign-on with interface.xlshosting.com
//  -------------------------------------------------------------------------
class TokenAuthView : public httpdobject
{
public:
						 TokenAuthView (N2ViewApp *papp);
						~TokenAuthView (void);
	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
							  
protected:
	N2ViewApp			&app;
};

//  -------------------------------------------------------------------------
/// Handler for snarfing the session-id out of the cookie header and
/// loading session-related data into the environment.
//  -------------------------------------------------------------------------
class CookieCutter : public httpdobject
{
public:
						 CookieCutter (class SessionDB *psdb, N2ViewApp &papp);
						~CookieCutter (void);

	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);

	class SessionDB		&sessionDB;
	N2ViewApp			&app;
};

//  -------------------------------------------------------------------------
/// Handler for the /user REST 'tree'
//  -------------------------------------------------------------------------
class UserView : public httpdobject
{
public:
						 UserView (N2ViewApp *papp);
						~UserView (void);
						
	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
};

class PingView : public httpdobject
{
public:
						 PingView (N2ViewApp *papp);
						~PingView (void);

	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
};
						

//  -------------------------------------------------------------------------
/// Handler for the /session REST tree.
//  -------------------------------------------------------------------------
class SessionView : public httpdobject
{
public:
						 SessionView (N2ViewApp *papp);
						~SessionView (void);
	
	int					 handleLogin (const value &, string &, value &);					
	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
	
protected:
	N2ViewApp			&app;
	pwfileauth			 pw;
};

//  -------------------------------------------------------------------------
/// Cache for group data
//  -------------------------------------------------------------------------
class GroupCache : public thread
{
public:
                         GroupCache (void);
                        ~GroupCache (void);
                        
    void                 run (void);
    void                 acquire (void);
    value               *get (void);

protected:
    lock<value>          data;
};

//  -------------------------------------------------------------------------
/// Handler for the /host/* REST tree
//  -------------------------------------------------------------------------
class RESTView : public httpdobject
{
public:
						 RESTView (N2ViewApp *papp, LabelResolver &r);
						~RESTView (void);
						
	string				*getLabel (const string &);

	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
	
	string				*getOverview (value &env);
	string				*getDetails (const string &host,
									 const string &timespec);
	string				*getLog (const string &host);
	string				*getAnalysis (const string &host);
	string				*getGraph (const string &host, const string &graph,
								   const string &timespec, int interval);
/*									 
	string				*getGraphInfo (const string &host,
									   const string &timespec);
	string				*getAnalysis (const string &host);
*/
	value				*getHostStats (const string &host,
									   const string &timespec="");
									   
	void				 processHStat (const value &hstat,
									   value &senv);
	xmlschema			 hostschema;
	xmlschema			 groupschema;
	LabelResolver		&resolver;
	scriptparser		 tmpl;
	GroupCache           groupcache;
};

//  -------------------------------------------------------------------------
/// Handler that gives monitored hosts their own stats back as xml.
//  -------------------------------------------------------------------------
class XMLStatsView : public httpdobject
{
public:
						 XMLStatsView (N2ViewApp *papp);
						~XMLStatsView (void);
	
	int					 run (string &uri, string &postbody,
							  value &inhdr, string &out,
							  value &outhdr, value &env,
							  tcpsocket &s);
};

#endif
