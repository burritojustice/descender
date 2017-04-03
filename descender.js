// start();
// 


function start(wof_id, wof_level) {

    console.log( wof_id );
    console.log( wof_level );

    // global variables for parent name
    var wof_parent = wof_id;
    var wof_parent_name;
    var api_key = 'mapzen-z2PnjDa'
    var wof_parent_url = 'https://whosonfirst-api.mapzen.com/?method=whosonfirst.places.getInfo&id=' + wof_parent + "&extras=geom:bbox,wof:hierarchy&api_key=" + api_key;
    var wof_parent_bbox;
    var wof_grandparent;
    var wof_hierarchy = [];
    var sw, ne;

    
    var includeParent = false;
//     var includeParentStatus = document.getElementById("includeParent");
//     if (includeParentStatus.checked == "true") {
//         includeParent = true;
//     }

    var loop_position;
    
    // define XHR stuff

    var xhr = new XMLHttpRequest();
    var xhr_parent = new XMLHttpRequest();
    var xhr_parent_wof = new XMLHttpRequest();

    // counters and arrays for descendants 

    var descendantsJSON = [];
    var descendantsCount = 0;
    var descendantsProcessed = 0;

    // array for descendant's GeoJSON 

    var features = [];
    
    // build url for list to get list of descendants 
    
    var url = 'https://whosonfirst-api.mapzen.com/?method=whosonfirst.places.getDescendants&id=' + wof_id +'&placetype=' + wof_level + '&page=1&per_page=500&api_key=' + api_key;
    // console.log(url);

    // get name of parent wof_id
    
    xhr_parent.open('GET', wof_parent_url, true);
    console.log(wof_parent_url);
    xhr_parent.send();
    xhr_parent.addEventListener("readystatechange", get_parent_name, false);   
    
    function get_parent_name(e) {
    if (xhr_parent.readyState == 4 && xhr_parent.status == 200) {
        console.log("getting parent name: " + Date());
        response = JSON.parse(xhr_parent.responseText);
        //get parent name
        wof_parent_name = response.record['wof:name'];
        wof_parent_bbox = response.record['geom:bbox'];
        wof_parent_type = response.record['wof:placetype'];
        wof_grandparent = response.record['wof:parent_id'];
//         wof_parent_geojson = response.record['geometry'];
        // wof_hierarchy = response.record['wof:hierarchy']['continent_id'];
        console.log("grandparent: " + wof_grandparent);
        
        // chop up and rearrange bounding box
        var latlon = wof_parent_bbox.split(',');
        sw = [latlon[1],latlon[0]];
        ne = [latlon[3],latlon[2]];

        console.log(wof_parent_name + " bbox: sw=" + sw + " ne= " + ne);
//         alert("About to fitBounds to " + sw + "/" + ne);
        map.fitBounds([sw,ne]);
//         L.geoJson(wof_parent_geojson, {style: {weight:2, color:'#ff0000'}}).addTo(map);

        console.log("hey mom and dad: " + wof_parent_name);
        
// pluralize -- probably a bad way to do this as it changes wof_level but

        if (wof_level == "ocean") {
            wof_level = "oceans";
        }        
        if (wof_level == "county") {
            wof_level = "counties";
        }
        if (wof_level == "country") {
            wof_level = "countries";
        }
        if (wof_level == "region") {
            wof_level = "regions";
        }
        if (wof_level == "postalcode") {
            wof_level = "postal codes";
        }        
        if (wof_level == "locality") {
            wof_level = "localities";
        }           
        if (wof_level == "neighbourhood") {
            wof_level = "neighbourhoods";
        }           
        if (wof_level == "neighbourhood") {
            wof_level = "neighbourhoods";
        }  
        if (wof_level == "microhood") {
            wof_level = "microhoods";
        }                        
        if (wof_level == "disputed") {
            wof_level = "disputed areas";
        }  
        if (wof_level == "timezone") {
            wof_level = "timezones";
        }                     
                
        // add parent name to page
        var parent_name = document.getElementById("parent_name");
        var p0 = document.getElementById("p0");
        var p1 = document.getElementById("p1");
        var h2 = document.getElementById("h2");
        var save = document.getElementById("save");
        // clear out previous name, if any
        p0.innerHTML = "";
        p1.innerHTML = "parent is  " + wof_parent_name + ", grandparent is " + wof_grandparent + "! ";
        // update button text
        save.innerHTML = "hold on getting " + wof_level;
        save.disabled = "disabled";
        var t = document.createTextNode(wof_level + " in the " + wof_parent_type + " of " + wof_parent_name + "! ");
        p0.appendChild(t);
        } 
    }
    

    // get list of descendants            

    xhr.open('GET', url, true);
    xhr.send();
    xhr.addEventListener("readystatechange", process_wof_id, false);

    // check readyState of XHR request for descendant list

    function process_wof_id(e) {
    if (xhr.readyState == 4 && xhr.status == 200) {
        console.log("building URLs: " + Date());
        response = JSON.parse(xhr.responseText);
        descendantsCount = response.results.length;
        
        var parent_wof_url = makeWOFURL(wof_parent);
        var wof_url = []; 
//         if (includeParent) {
//             console.log("including parent!");
//             //bumping up descendantsCount, inserting url of parent 
//             descendantsCount++;
//             wof_url[descendantsCount] = parent_wof_url;
//         }
        
        
        // loop through list and parse WOF IDs to build URLs
        for (var i = 0; i < descendantsCount; i++) {
            var wof_id = response.results[i]['wof:id'];
            var wof_name = response.results[i]['wof:name'];
            console.log(wof_name + ": " + wof_level);
//             var wof_url = []; 
            wof_url[i] = makeWOFURL(wof_id);
            
            console.log(wof_url[i]);
            //download and process the descendant 
            var xhr2 = new XMLHttpRequest();
            xhr2.open('GET', wof_url[i], true);
            console.log("getting " + i);
            xhr2.send();
            xhr2.addEventListener("readystatechange", process_wof_descendant, false);
        } //for
    
        // count and wait
    
        var wait = function() {
            console.log("WAITING..." + descendantsProcessed + " of " + descendantsCount);
             if (descendantsProcessed < descendantsCount){
                            setTimeout(wait, 500);
                            console.log("buffering...");
                            return;
            }
            
            // once we're done, glom GeoJSON of descendants into a feature collection
            
            feature_collection = {
                'type': 'FeatureCollection',
                'features': features,
            }
            
            // dump GeoJSON into blob
            console.log("starting blob " + Date());
            var args = {type: "application/json"};
            var blob = new Blob([JSON.stringify(feature_collection)], args);
            console.log("stopping blob " + Date());
            var filename = wof_parent_name + '_' + wof_parent + '_' + wof_level + '_' + descendantsCount + '.geojson'
            
            // get size of blob
            var blobSize = (blob.size);
            var blobSizeMB = formatSizeUnits(blobSize);
            
            // update button text
            var save = document.getElementById("save");
            save.disabled = "";
            save.innerHTML = "CLICK UPON MY " + blobSizeMB + " GEOJSON BLOB OF " + descendantsCount + " " + wof_level + " IN " +  wof_parent_name;
            
            // wait for user to click on the button to save the blob
            save.onclick = function() {
                saveAs(blob, filename);
            }
        } // function wait
        wait();
        } //if
    } //function

    function process_wof_descendant(e) {
    if (this.readyState == 4 && this.status == 200) {
    
        // JSONify WOF data 
        this.wofJSON = this.responseText;  
        feature = JSON.parse(this.responseText);
        var wof_name = feature.properties['wof:name'];
        var wof_id = feature.properties['wof:id'];
        var wof_placetype = feature.properties['wof:placetype'];


        // add descendant's JSON to features array and map -- if/else was to check to see if parent should also be included but that's on hold
        console.log(wof_name + " vs " + wof_parent_name);
        if ((includeParent == false) && (wof_name == wof_parent_name)) {
            console.log("checkbox = " + includeParent + " so not including " + wof_name);
        }
        else {
            features.push(feature); 
            if (wof_placetype == "disputed"){
                L.geoJson(feature, {style: {weight:2, color:'#ff0000'}}).addTo(map);

            }
            else {
            L.geoJson(feature, {style: {weight:2}}).addTo(map);
            }
        }
        
        // add descendant names to list below map
        var descendant_name = document.getElementById("descendant_name");
        var child = document.getElementById("p1");
//         var node = document.createTextNode((1 + descendantsProcessed) + ": " + wof_name + "! (" + wof_id + ") ");
//         var descendant_link = (1 + descendantsProcessed) + ": " + wof_name + "! (" + wof_id + ") ";
        var descent_type;
        if (wof_placetype == "country") {
            descent_type = "region";
        }
        if (wof_placetype == "region") {
            descent_type = "county";
        }        
        if (wof_placetype == "county") {
            descent_type = "locality";
        }        
        if (wof_placetype == "locality") {
            descent_type = "postalcode";
        }            
        var descendant_url = "?wof_id=" + wof_id + "&wof_level=" + descent_type;
        var descendant_link = (1 + descendantsProcessed) + ": " + "<a href=" + descendant_url + ">" + wof_name + "</a>! ";


//         child.appendChild(node);
        child.innerHTML = child.innerHTML + descendant_link;
        console.log('processed: ' + (1 + descendantsProcessed) + ' of ' + descendantsCount);
        descendantsProcessed++;

        } else {
        console.log("uh oh");
        }

    }


    function makeWOFURL(wof_id) {
    // parse the ID into groups of three to build the WOF url
    var id = wof_id.toString();
    var wof = [];
    for (var i = 0; i < id.length; i = i + 3) {
        var j = ((i + 3)/3) - 1;
        wof[j] = id.slice(i, i + 3);
    }
    var wof_url_prefix = 'https://whosonfirst.mapzen.com/data/';
    var wof_url_suffix =  id + '.geojson';
    var wof_url_middle = '';
    var i = 0;   
    while (wof[i]) {
        wof_url_middle += wof[i] + '/';
        i++;
    }
    if (id == 0) {
    wof_url_middle = "0/";
    wof_url_suffix = '0.geojson';
    }
    wof_url = wof_url_prefix + wof_url_middle + wof_url_suffix;
    return wof_url;
    }

    function formatSizeUnits(bytes){
            if      (bytes>=1000000000) {bytes=(bytes/1000000000).toFixed(1)+' GB';}
            else if (bytes>=1000000)    {bytes=(bytes/1000000).toFixed(1)+' MB';}
            else if (bytes>=1000)       {bytes=(bytes/1000).toFixed(1)+' KB';}
            else if (bytes>1)           {bytes=bytes+' bytes';}
            else if (bytes==1)          {bytes=bytes+' byte';}
            else                        {bytes='0 byte';}
            return bytes;
    }

    function topojsonify() {
    // holding spot for topojson conversion
    }

}
