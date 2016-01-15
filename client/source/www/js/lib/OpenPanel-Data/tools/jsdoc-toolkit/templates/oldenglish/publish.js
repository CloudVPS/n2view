require("app/JsHilite.js");

function basename(filename) {
   filename.match(/([^\/\\]+)\.[^\/\\]+$/);
   return RegExp.$1;
}

function getClassLink(theClass, baseClass) {
   if (theClass.root)
   {
      return "Object";
   }
   else if (theClass == baseClass)
   {
      return theClass.alias;
   }
   else
   {
      return "<a href='" + theClass.outfile + "' target='main'>" + theClass.alias + "</a>";
   }
}

function getHierarchy(fileGroup, theClass) {
   if (theClass.augments.length > 0)
   {
      var hierarchy = [];
      var clz = theClass;
      while (clz.augments.length > 0)
      {
         hierarchy.push(clz);
         clz = fileGroup.getSymbol(clz.augments[0]);
      }
      hierarchy.push(clz);

      // Add "Object"
      hierarchy.push({root:true});

      var rev = [];
      for (var h = hierarchy.length-1; h > -1; h--)
      {
         rev.push(hierarchy[h]);
      }

      var out = "<pre>";
      var ind = "   ";
      chain = "";
      for (var r in rev)
      {
         out += chain + getClassLink(rev[r], theClass);
         chain = "\n" + ind + "|\n" + ind + "+--";
         ind += "   ";
      }
      out += "</pre>";
      return out;
   }
   else
   {
      return null;
   }
}


function publish(fileGroup, context) {
   var fileClassesTemplate = new JsPlate(context.t+"file-classes.tmpl");
   var fileSummaryTemplate = new JsPlate(context.t+"file-summary.tmpl");
   var classTemplate = new JsPlate(context.t+"class.tmpl");
   var allClassesTemplate = new JsPlate(context.t+"all-classes.tmpl");
   var allFilesTemplate = new JsPlate(context.t+"all-files.tmpl");
   var libraryOverviewTemplate = new JsPlate(context.t+"library-overview.tmpl");
   var indexTemplate = new JsPlate(context.t+"index.tmpl");

   var allFiles = {};
   var allClasses = {};
   var allFileClasses = {};
   var globals = {methods:[], properties:[], alias:"GLOBALS", isStatic:true};

   for (var i = 0; i < fileGroup.files.length; i++) {
      var file_basename = basename(fileGroup.files[i].filename);
      var file_srcname = file_basename+".src.html";

      for (var s = 0; s < fileGroup.files[i].symbols.length; s++) {
         if (fileGroup.files[i].symbols[s].isa == "CONSTRUCTOR") {
            var thisClass = fileGroup.files[i].symbols[s];
            // sort inherited methods by class
            var inheritedMethods = fileGroup.files[i].symbols[s].getInheritedMethods();
            if (inheritedMethods.length > 0) {
               thisClass.inherited = {};
               for (var n = 0; n < inheritedMethods.length; n++) {
                  if (! thisClass.inherited[inheritedMethods[n].memberof]) thisClass.inherited[inheritedMethods[n].memberof] = [];
                  thisClass.inherited[inheritedMethods[n].memberof].push(inheritedMethods[n]);
               }
            }

            thisClass.name = fileGroup.files[i].symbols[s].alias;
            thisClass.source = file_srcname;
            thisClass.filename = fileGroup.files[i].filename;
            thisClass.docs = thisClass.name+".html";

            if (!allClasses[thisClass.name]) allClasses[thisClass.name] = [];
            allClasses[thisClass.name].push(thisClass);
         }
         else if (fileGroup.files[i].symbols[s].alias == fileGroup.files[i].symbols[s].name) {
            if (fileGroup.files[i].symbols[s].isa == "FUNCTION") {
               globals.methods.push(fileGroup.files[i].symbols[s]);
            }
            else {
               globals.properties.push(fileGroup.files[i].symbols[s]);
            }
         }
      }

      if (!allFiles[fileGroup.files[i].path]) {
         var hiliter = new JsHilite(IO.readFile(fileGroup.files[i].path));

         // Modify the hiliter to not generate an entire document
         hiliter.header = "<style>\n\
         .KEYW {color: #933;}\n\
         .COMM {color: #bbb; font-style: italic;}\n\
         .NUMB {color: #393;}\n\
         .STRN {color: #393;}\n\
         .REGX {color: #339;}\n\
         .linenumber {border-right: 1px dotted #666; color: #666; font-style: normal;}\n\
         </style><pre>";
         hiliter.footer = "</pre>";

         // Generate the source code
         var outSrc = hiliter.hilite();

         var output = fileSummaryTemplate.process([fileGroup.files[i], outSrc]);
         IO.saveFile(context.d, file_srcname, output);
      }
      fileGroup.files[i].source = file_srcname;
      allFiles[fileGroup.files[i].path] = true;
   }

   for (var c in allClasses) {
      var outfile = c+".html";
      allClasses[c].outfile = outfile;
      allClasses[c].classTree = getHierarchy(fileGroup, allClasses[c][0]);
      var output = classTemplate.process(allClasses[c]);
      IO.saveFile(context.d, outfile, output);
   }

   for (var f in fileGroup.files) {
      var b = basename(fileGroup.files[f].filename);
      var outfile = "classes-" + b + ".html";
      var output = fileClassesTemplate.process(fileGroup.files[f]);
      IO.saveFile(context.d, outfile, output);
      allFileClasses[b] = outfile;
   }

   output = classTemplate.process([globals]);
   IO.saveFile(context.d, "globals.html", output);

   var output = libraryOverviewTemplate.process(fileGroup.files);
   IO.saveFile(context.d, "library-overview.html", output);

   var output = allFilesTemplate.process(allFileClasses);
   IO.saveFile(context.d, "all-files.html", output);

   var output = allClassesTemplate.process(allClasses);
   IO.saveFile(context.d, "all-classes.html", output);

   var output = indexTemplate.process([]);
   IO.saveFile(context.d, "index.html", output);
}
