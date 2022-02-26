let map, datasource, pipeline, client, popup, searchInput, resultsPanel, locationsPanel, searchInputLength, centerMapOnResults, allLocations, optimizer, optimizeButton;

//The minimum number of characters needed in the search input before a search is performed.
let minSearchInputLength = 3;

//The number of ms between key strokes to wait before performing a search.
let keyStrokeDelay = 150;

allLocations = [];

function GetMap() {
    //Initialize a map instance.
    map = new atlas.Map('myMap', {
        center: [77.3910, 28.5355],
        zoom: 14,
        view: 'Auto',

        //Add authentication details for connecting to Azure Maps.
        authOptions: {
            //Use Azure Active Directory authentication.
            // authType: 'anonymous',
            // clientId: '04ec075f-3827-4aed-9975-d56301a2d663', //Your Azure Active Directory client id for accessing your Azure Maps account.
            // getToken: function (resolve, reject, map) {
            //     //URL to your authentication service that retrieves an Azure Active Directory Token.
            //     let tokenServiceUrl = "https://azuremapscodesamples.azurewebsites.net/Common/TokenService.ashx";
            //
            //     fetch(tokenServiceUrl).then(r => r.text()).then(token => resolve(token));
            // }

            //Alternatively, use an Azure Maps key. Get an Azure Maps key at https://azure.com/maps. NOTE: The primary key should be used as the key.
            authType: 'subscriptionKey',
            subscriptionKey: '_pacqFB4xBOSSaDZQgsYqYXS-s9YD4p6i0WVPI8AZrA'
        }
    });

    //Store a reference to the Search Info Panel.
    resultsPanel = document.getElementById("results-panel");

    //Store a reference to the Locations Panel
    locationsPanel = document.getElementById('locations-panel');

    //Store a reference to the Optimize Button
    optimizeButton = document.getElementById('submit-button');

    //Add key up event to the search box.
    searchInput = document.getElementById("search-input");
    searchInput.addEventListener("keyup", searchInputKeyup);

    //Create a popup which we can reuse for each result.
    popup = new atlas.Popup();

    //Wait until the map resources are ready.
    map.events.add('ready', function () {

        //Add the zoom control to the map.
        map.controls.add(new atlas.control.ZoomControl(), {
            position: 'top-right'
        });

        //Create a data source and add it to the map.
        datasource = new atlas.source.DataSource();
        map.sources.add(datasource);

        //Add a layer for rendering point data.
        let searchLayer = new atlas.layer.SymbolLayer(datasource, null, {
            iconOptions: {
                image: 'pin-round-darkblue',
                anchor: 'center',
                allowOverlap: true
            },
            filter: ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.
        });
        map.layers.add(searchLayer);

        //Add a layer for rendering the route lines and have it render under the map labels.
        map.layers.add(new atlas.layer.LineLayer(datasource, null, {
            strokeColor: ['get', 'strokeColor'],
            strokeWidth: ['get', 'strokeWidth'],
            lineJoin: 'round',
            lineCap: 'round'
        }), 'labels');

        //Add a click event to the search layer and show a popup when a result is clicked.
        map.events.add("click", searchLayer, function (e) {
            //Make sure the event occurred on a shape feature.
            if (e.shapes && e.shapes.length > 0) {
                showPopup(e.shapes[0]);
            }
        });
    });

    //Use MapControlCredential to share authentication between a map control and the service module.
    pipeline = atlas.service.MapsURL.newPipeline(new atlas.service.MapControlCredential(map));

    optimizer = new atlas.service.RouteURL(pipeline);
}
function searchInputKeyup(e) {
    centerMapOnResults = false;
    if (searchInput.value.length >= minSearchInputLength) {
        if (e.keyCode === 13) {
            centerMapOnResults = true;
        }
        //Wait 100ms and see if the input length is unchanged before performing a search.
        //This will reduce the number of queries being made on each character typed.
        setTimeout(function () {
            if (searchInputLength === searchInput.value.length) {
                search();
            }
        }, keyStrokeDelay);
    } else {
        resultsPanel.innerHTML = '';
    }
    searchInputLength = searchInput.value.length;
}
function search() {
    //Remove any previous results from the map.
    datasource.clear();
    popup.close();
    resultsPanel.innerHTML = '';

    //Construct the SearchURL object
    let searchURL = new atlas.service.SearchURL(pipeline);

    let query = document.getElementById("search-input").value;
    searchURL.searchFuzzy(atlas.service.Aborter.timeout(10000), query, {
        lon: map.getCamera().center[0],
        lat: map.getCamera().center[1],
        maxFuzzyLevel: 4,
        view: 'Auto'
    }).then((results) => {

        //Extract GeoJSON feature collection from the response and add it to the datasource
        let data = results.geojson.getFeatures();
        datasource.add(data);

        if (centerMapOnResults) {
            map.setCamera({
                bounds: data.bbox
            });
        }

        //Create the HTML for the results list.
        let html = [];
        for (let i = 0; i < data.features.length; i++) {
            let r = data.features[i];
            html.push('<li onclick="itemClicked(\'', r.id, '\')" onmouseover="itemHovered(\'', r.id, '\')">')
            html.push('<div class="title">');
            if (r.properties.poi && r.properties.poi.name) {
                html.push(r.properties.poi.name);
            } else {
                html.push(r.properties.address.freeformAddress);
            }
            html.push('</div><div class="info">', r.properties.type, ': ', r.properties.address.freeformAddress, '</div>');
            if (r.properties.poi) {
                if (r.properties.phone) {
                    html.push('<div class="info">phone: ', r.properties.poi.phone, '</div>');
                }
                if (r.properties.poi.url) {
                    html.push('<div class="info"><a href="https://', r.properties.poi.url, '">https://', r.properties.poi.url, '</a></div>');
                }
            }
            html.push('</li>');
            resultsPanel.innerHTML = html.join('');
        }

    });
}
function itemHovered(id) {
    //Show a popup when hovering an item in the result list.
    let shape = datasource.getShapeById(id);
    showPopup(shape);
}
function itemClicked(id) {
    //Center the map over the clicked item from the result list.
    let shape = datasource.getShapeById(id);
    map.setCamera({
        center: shape.getCoordinates(),
        zoom: 17
    });

    // Add location to destinations
    let html = [];
    // Only add unique elements
    if (!document.getElementById(id)) {
        html.push('<li id="' + id + '"><div class="title">');
        if (shape.data.properties.poi && shape.data.properties.poi.name) {
            html.push(shape.data.properties.poi.name);
        } else {
            html.push(shape.data.properties.address.streetName);
        }
        html.push('</div><div class="info">', shape.data.properties.type, ': ', shape.data.properties.address.freeformAddress, '</div>');
        if (shape.data.properties.poi) {
            if (shape.data.properties.phone) {
                html.push('<div class="info">phone: ', shape.data.properties.poi.phone, '</div>');
            }
            if (shape.data.properties.poi.url) {
                html.push('<div class="info"><a href="https://', shape.data.properties.poi.url, '">https://', shape.data.properties.poi.url, '</a></div>');
            }
        }
        html.push('<a href="javascript:removeLocation(\'' + id + '\')">Remove</a>')
        html.push('</li>');
        allLocations.push(shape);
        locationsPanel.innerHTML += html.join('');
        // Hide search results
        setTimeout(bodyClicked, 500);
    }
}

function bodyClicked() {
    // Hide the search results
    resultsPanel.style.display = 'none';
}

function searchClicked() {
    // Show the search results
    resultsPanel.style.display = 'block';
}

function removeLocation(id) {
    // Remove a item from locations list
    document.getElementById(id).remove();
    allLocations = allLocations.filter(function(shape){
        return shape.data.id !== id;
    });
}

function showPopup(shape) {
    let properties = shape.getProperties();
    //Create the HTML content of the POI to show in the popup.
    let html = ['<div class="poi-box">'];
    //Add a title section for the popup.
    html.push('<div class="poi-title-box"><b>');

    if (properties.poi && properties.poi.name) {
        html.push(properties.poi.name);
    } else {
        html.push(properties.address.freeformAddress);
    }
    html.push('</b></div>');
    //Create a container for the body of the content of the popup.
    html.push('<div class="poi-content-box">');
    html.push('<div class="info location">', properties.address.freeformAddress, '</div>');
    if (properties.poi) {
        if (properties.poi.phone) {
            html.push('<div class="info phone">', properties.phone, '</div>');
        }
        if (properties.poi.url) {
            html.push('<div><a class="info website" href="https://', properties.poi.url, '">https://', properties.poi.url, '</a></div>');
        }
    }
    html.push('</div></div>');
    popup.setOptions({
        position: shape.getCoordinates(),
        content: html.join('')
    });
    popup.open(map);
}

function download(content, fileName, contentType) {
    let a = document.createElement("a");
    let file = new Blob([content], {type: contentType});
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}

function optimizeRoute() {
    optimizeButton.disabled = true;
    optimizeButton.innerText = 'Optimizing. Please Wait...';


    let coords = [];
    allLocations.forEach((location) => {
        coords.push([location.data.geometry.coordinates[0], location.data.geometry.coordinates[1]])
    });

    datasource.clear();

    //Create the GeoJSON objects which represent the start and end point of the route.
    let startPoint = new atlas.data.Feature(new atlas.data.Point([allLocations[0].data.geometry.coordinates[0], allLocations[0].data.geometry.coordinates[1]]), {
        title: allLocations[0].data.properties.id,
        icon: 'pin-blue'
    });

    let endPoint = new atlas.data.Feature(new atlas.data.Point([allLocations[allLocations.length - 1].data.geometry.coordinates[0], allLocations[allLocations.length - 1].data.geometry.coordinates[1]]), {
        title: allLocations[allLocations.length - 1].data.properties.id,
        icon: 'pin-round-blue'
    });

    //Add the data to the data source.
    datasource.add([startPoint, endPoint]);

    let today = new Date();

    optimizer.calculateRouteDirections(atlas.service.Aborter.timeout(30000), coords, {
        computeBestOrder: true,
        RouteType: 'shortest',
    }).then((route) => {
       let data = route.geojson.getFeatures();
       //Get the route line and add some style properties to it.
       let routeLine = data.features[0];
       routeLine.properties.strokeColor = '#2272B9';
       routeLine.properties.strokeWidth = 9;

        datasource.add(routeLine);

        //Fit the map window to the bounding box defined by the start and end positions.
        map.setCamera({
            bounds: atlas.data.BoundingBox.fromData([startPoint, endPoint]),
            padding: 100,
        });

        let filename = today.getFullYear() + "-" + today.getMonth() + "-" + today.getDate() + "_" + today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

        download(JSON.stringify(route.routes), "OptimizedRoute_" + filename + "_route.json", 'text/json');
   });

    optimizeButton.style["font-size"] = "12px";
    optimizeButton.innerText = 'Optimized. Please refresh to use again.';

}
