#include <grace/system.h>
#include <grace/filesystem.h>
#include <grace/process.h>
#include <grace/daemon.h>
#include "resolver.h"

// ==========================================================================
// CONSTRUCTOR LabelResolver
// ==========================================================================
LabelResolver::LabelResolver (void) : expireThread (this)
{
	cache.o.loadshox ("/var/state/n2/labelcache.dat");
}

// ==========================================================================
// DESTRUCTOR LabelResolver
// ==========================================================================
LabelResolver::~LabelResolver (void)
{
}

// ==========================================================================
// METHOD LabelResolver::spawn
// ==========================================================================
void LabelResolver::spawn (void)
{
	expireThread.spawn();
}

// ==========================================================================
// METHOD LabelResolver::shutdown
// ==========================================================================
void LabelResolver::shutdown (void)
{
	expireThread.shutdown();
}

// ==========================================================================
// METHOD LabelResolver::resolve
// ==========================================================================
string *LabelResolver::resolve (const statstring &ip)
{
	returnclass (string) res retain;
	
	sharedsection (cache)
	{
		if (cache.exists (ip))
		{
			res = cache[ip]["name"];
			breaksection return &res;
		}
	}
	
	if (! res)
	{
		res = extResolve (ip);
	}
	return &res;
}

// ==========================================================================
// METHOD LabelResolver::extResolve
// ==========================================================================
string *LabelResolver::extResolve (const statstring &ip)
{
	returnclass (string) res retain;

	timestamp tnow = core.time.now ();
	timestamp texp;
	
	if (fs.exists ("/usr/bin/n2resolve"))
	{
		string cmd = "/usr/bin/n2resolve %s" %format (ip);
		systemprocess presolve (cmd);
		presolve.run ();
		while (! presolve.eof())
		{
			res += presolve.read (4096);
		}
		presolve.serialize ();
		res.cropat ('\n');
		
		if (res)
		{
			texp = tnow;
			texp += (900 + (rand() & 1023));
			exclusivesection (cache)
			{
				cache[ip]["expires"] = texp;
				cache[ip]["name"] = res;
			}
		}
		else
		{
			texp = tnow;
			texp += (60 + (rand() & 63));
			exclusivesection (cache)
			{
				cache[ip]["expires"] = texp;
				cache[ip]["name"] = "";
			}
		}
	}
	
	return &res;
}

// ==========================================================================
// METHOD LabelResolver::doexpire
// ==========================================================================
void LabelResolver::doexpire (void)
{
	value list;
	timestamp tnow = core.time.now ();
	timestamp texp;
	
	sharedsection (cache) list = cache;
	
	foreach (node, list)
	{
		texp = node["expires"];
		if (texp < tnow)
		{
			statstring ip = node.id();
			string label = extResolve (ip);
			__musleep (80);
		}
	}
	
	sharedsection (cache)
	{
		cache.saveshox ("/var/state/n2/labelcache.dat", flag::atomic);
	}
}

// ==========================================================================
// CONSTRUCTOR LabelExpireThread
// ==========================================================================
LabelExpireThread::LabelExpireThread (LabelResolver *r)
	: thread ("expire"), resolver (*r)
{
}

// ==========================================================================
// DESTRUCTOR LabelExpireThread
// ==========================================================================
LabelExpireThread::~LabelExpireThread (void)
{
}

// ==========================================================================
// METHOD LabelExpireThread::run
// ==========================================================================
void LabelExpireThread::run (void)
{
	log::write (log::info, "expire", "Cache expiry thread started");
	while (true)
	{
		value ev = waitevent (60000);
		if (! ev)
		{
			log::write (log::info, "expire", "Starting expire run");
			resolver.doexpire ();
		}
		else if (ev.type() == "shutdown")
		{
			log::write (log::info, "expire", "Exiting thread");
			break;
		}
	}
	
	shutdownCondition.broadcast ();
}

// ==========================================================================
// METHOD LabelExpireThread::shutdown
// ==========================================================================
void LabelExpireThread::shutdown (void)
{
	sendevent ("shutdown");
	shutdownCondition.wait ();
}
