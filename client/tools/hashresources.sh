#!/bin/bash

for f in `more $1 | grep script.*src | sed -e 's/.*src="/source\/www\//' -e 's/">.*//'`; do 
	echo $f
	echo -e "\n" 
done



#files=$1

#for resource in `find * -type f`; do
#    resource=`expr "$resource" : '\./\(.*\)'`
##    if grep -q "$resource" "$HTML" ; then
 #       hash=`md5sum "$resource"`
#        #echo "$resource?${hash:0:8}"
        
#        sed -i 's/"$resource"/"/$resource?${hash:0:12}/' "$HTML"
#        #sed -i "s^url($resource)^url(/$resource?${hash:0:12})^" "$HTML"
#        #sed -i "s^=\"/$resource\"^=\"/$resource?${hash:0:12}\"^" "$HTML"
#        #sed -i "s^url(/$resource)^url(/$resource?${hash:0:12})^" "$HTML"
#    fi
#done
