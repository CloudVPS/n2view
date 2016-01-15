include makeinclude
PREFIX  = /usr/local
OBJ	= main.o resolver.o restview.o

all: n2view.exe n2passwd
	@echo "* BUILD n2view.app"
	@grace mkapp --appid net.xl-is.svc.n2view n2view
	./buildclient

n2passwd: n2passwd.o
	@$(LD) $(LDFLAGS) -o n2passwd n2passwd.o $(LIBS)

n2view.exe: $(OBJ)
	@echo "* LINK n2view.exe"
	@$(LD) $(LDFLAGS) -o n2view.exe $(OBJ) $(LIBS) -lz

clean:
	rm -f *.o *.exe
	rm -rf n2view.app
	rm -f n2view

install: n2view.exe
	@grace mkapp --appid net.xl-is.svc.n2view --dest $(PREFIX)/sbin n2view
	@install -m 644 n2resolve $(PREFIX)/bin/n2resolve
	@mkdir -p /usr/share/n2view/docroot/n2
	@cp -r client/build/www/* $(PREFIX)/share/n2view/docroot/n2

makeinclude:
	@echo please run ./configure
	@false

SUFFIXES: .cpp .o
.cpp.o:
	@echo "* COMPILE $<"
	@$(CXX) $(CXXFLAGS) $(INCLUDES) -c $<
