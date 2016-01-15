#ifndef _N2VIEW_RESOLVER_H
#define _N2VIEW_RESOLVER_H 1

#include <grace/value.h>
#include <grace/lock.h>
#include <grace/timestamp.h>
#include <grace/ipaddress.h>
#include <grace/thread.h>

//  -------------------------------------------------------------------------
/// Simple thread that runs the doexpire() method of the LabelResolver
/// object passed to its constructor every 60 seconds.
//  -------------------------------------------------------------------------
class LabelExpireThread : public thread
{
public:
						 /// Constructor.
						 /// \param r The LabelResolver object to use.
						 LabelExpireThread (class LabelResolver *r);
						 
						 /// Destructor.
						~LabelExpireThread (void);
				
						 /// Run-method. Currently an infinite loop.
	void				 run (void);
	
						 /// Shut down the thread.
	void				 shutdown (void);
	
protected:
	class LabelResolver	&resolver; ///< Link back to the LabelResolver.
	conditional			 shutdownCondition;
};

//  -------------------------------------------------------------------------
/// A class handling the external resolving of host-labels attached to
/// IP-addresses.
//  -------------------------------------------------------------------------
class LabelResolver
{
public:
						 /// Constructor. Loads the cache file from
						 /// /var/state/n2/labelcache.dat, if it
						 /// exists.
						 LabelResolver (void);
					 
						 /// Destructor.
						~LabelResolver (void);
	
						 /// Resolve the label for a given ip-address.
						 /// If it is found in the cache, this item
						 /// is returned, otherwise the extResolve()
						 /// method will be used to call n2resolve and
						 /// put its results in the cache.
						 /// \param ip The ip address to resolve.
						 /// \return The resolved string, or an empty string
						 ///         if the host could not be resolved.
	string				*resolve (const statstring &ip);
	
						 /// Runs over the cache list and calls
						 /// extResolve() on any nodes that are
						 /// expired.
	void				 doexpire (void);

						 /// Starts the expire thread.	
	void				 spawn (void);
	
						 /// Shuts down the expire thread.
	void				 shutdown (void);

protected:
						 /// Calls n2resolve and stores its results
						 /// in the cache with a random expiration
						 /// time between 15 and ~30 minutes.
						 /// \param ip The IP address to resolve.
	string				*extResolve (const statstring &ip);
	
						 /// The actual cache data. Stored as a
						 /// dictionary keyed by the ip address,
						 /// with each node being a dictionary
						 /// with two keys:
						 /// - expires: The expiry timestamp.
						 /// - name: The resolved label.
	lock<value>			 cache;
	
						 /// The LabelExpireThread instance.
	LabelExpireThread	 expireThread;
};

#endif
