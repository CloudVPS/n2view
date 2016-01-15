#include <grace/application.h>
#include <grace/system.h>
#include <grace/terminal.h>
#include <grace/filesystem.h>
#include <fcntl.h>

#define PWFILE "/etc/n2/n2view.passwd"

class n2passwdApp : public application
{
public:
	n2passwdApp (void)
		: application ("net.xl-is.tools.n2passwd"),
		  term (this, fin, fout)
	{
		opt = $("-h", $("long", "--help")) ->
			  $("-c", $("long", "--create")) ->
			  $("-m", $("long", "--modify")) ->
			  $("-n", $("long", "--newpass")) ->
			  $("-d", $("long", "--delete")) ->
			  $("-i", $("long", "--iplist")) ->
			  $("-g", $("long", "--pwgen")) ->
			  $("-p", $("long", "--password")) ->
			  $("--create",
			  		$("argc",0) ->
			  		$("help", "Create a new account")) ->
			  $("--delete",
			  		$("argc",0) ->
			  		$("help", "Delete an account")) ->
			  $("--modify",
			  		$("argc",0) ->
			  		$("help", "Modify an account")) ->
			  $("--iplist",
			  		$("argc",1) ->
			  		$("help", "Set allowed IPs (comma-separated)")) ->
			  $("--newpass",
			  		$("argc",0) ->
			  		$("help", "Set a new password for the account")) ->
			  $("--pwgen",
			  		$("argc",0) ->
			  		$("help", "Automatically generate the password")) ->
			  $("--password", $("argc",1) ->
			  				  $("help", "Set password from command argument"));
	}
	
	~n2passwdApp (void)
	{
	}
	
	int main (void)
	{
		bool isdelete = argv.exists ("--delete");
		bool iscreate = argv.exists ("--create");
		bool ismodify = argv.exists ("--modify");
		bool genpass = argv.exists ("--pwgen");
		bool newpass = argv.exists ("--newpass");
		string ipstring;
		value iplist;
		string passwd;
		string pwcrypt;
		string username;
		
		if (argv.exists ("--iplist"))
		{
			ipstring = argv["--iplist"];
			iplist = strutil::split (ipstring, ',');
		}
		
		if (iscreate && iplist.count() == 0)
		{
			ferr.writeln ("Warning: Account will be admin, use --iplist to restrict.");
		}
		
		if ( (!isdelete) && (!iscreate) && (!ismodify) )
		{
			ferr.writeln ("One of --delete, --create, --modify needed");
			return 1;
		}
		
		if (argv["*"].count() == 0)
		{
			ferr.writeln ("Missing username");
			return 1;
		}
		
		username = argv["*"][0];
		
		if ((! isdelete) && ((! ismodify) || (genpass || newpass)))
		{
			if (genpass)
			{
				passwd = generatePassword();
				fout.writeln ("Password: %s" %format (passwd));
			}
			else if (! argv.exists ("--password"))
			{
				passwd = term.readpass ("Password: ");
			}
			else passwd = argv["--password"];
		}
		
		if (passwd) pwcrypt = core.pwcrypt.des (passwd);
		
		if (iscreate)
		{
			file f;
			f.openappend (PWFILE);
			f.writeln ("%s:%s:%s" %format (username, pwcrypt, ipstring));
			f.close ();
		}
		else
		{
			file pwin;
			file pwout;
			
			pwin.openread (PWFILE);
			pwout.openwrite (PWFILE ".tmp");
			
			while (! pwin.eof())
			{
				string line = pwin.gets();
				value splt = strutil::split (line, ':');
				if (splt.count() >= 2)
				{
					if (splt[0].sval() == username)
					{
						if (! isdelete)
						{
							if (pwcrypt) splt[1] = pwcrypt;
							if (iplist.count()) splt[2] = ipstring;
							
							pwout.writeln (splt.join (":"));
						}
					}
					else pwout.writeln (line);
				}
			}
			
			pwin.close();
			pwout.close();
			fs.mv (PWFILE ".tmp", PWFILE);
		}
		
		return 0;
	}

	string *generatePassword (void)
	{
		returnclass (string) res retain;
		
		string lcase = "abcdefghijkmnoprstuvwxyz";
		string ucase = "ACDEFGHJKLMNPRTUVWXYZ";
		string num = "23456789";
		
		char out[9];
		char taken[9];
		out[8] = 0;
		
		unsigned int seed;
		int sdf;
		seed = 0;
		
		sdf = open ("/dev/random", O_RDONLY);
		if (! sdf) return &res;
		read (sdf, &seed, sizeof(seed));
		close (sdf);
		
		if (seed == 0) return &res;
		srand (seed);
		
		int i;
		
		for (i=0; i<8; ++i)
		{
			out[i] = lcase[rand() % lcase.strlen()];
			taken[i] = 0;
		}
		
		i = rand() & 7;
		out[i] = ucase[rand() % ucase.strlen()];
		taken[i] = 1;

		while (taken[i]) i = rand() & 7;
		out[i] = ucase[rand() % ucase.strlen()];
		taken[i] = 1;

		while (taken[i]) i = rand() & 7;
		out[i] = num[rand() % num.strlen()];
		
		res = out;
		return &res;
	}
			
protected:
	terminal<n2passwdApp> term;
};

$appobject (n2passwdApp);

