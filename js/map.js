// Model
// List of locations
var places = [
    {
        title: 'Alcatraz',
        lat: 37.8270,
        lng: -122.4230,
        myData: '',
        visible: true
    },{
        title: "Fisherman's Wharf",
        lat: 37.8080,
        lng: -122.4177,
        myData: '',
        visible: true
    },{
        title: 'Golden Gate Bridge',
        lat: 37.8199,
        lng: -122.4783,
        myData: '',
        visible: true
    },{
        title: 'Union Square',
        lat: 37.7880,
        lng: -122.4074,
        myData: '',
        visible: true
    },{
        title: 'Lombard Street',
        lat: 37.8021,
        lng: -122.4187,
        myData: '',
        visible: true
    },{
        title: 'Embarcadero',
        lat: 37.7993,
        lng: -122.3977,
        myData: '',
        visible: true
    }
];

var map, googleError;

// Initiate the map
function initMap() {
    // Create a styles array to use with the map
    var styles = [
      {
        featureType: 'water',
        stylers: [
          { color: '#7490bc' }
        ]
      },{
        featureType: 'administrative',
        elementType: 'labels.text.stroke',
        stylers: [
          { color: '#ffffff' },
          { weight: 4 }
        ]
      },{
        featureType: 'administrative',
        elementType: 'labels.text.fill',
        stylers: [
          { color: '#000000' }
        ]
      }
    ];

    var sanFrancisco = {lat: 37.774929, lng: -122.419416};

    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: sanFrancisco,
        styles: styles,
        mapTypeId: google.maps.MapTypeId.TERRAIN
    });

    infowindow = new google.maps.InfoWindow({
        maxWidth: 200
    });

    ko.applyBindings(new ViewModel());
}

// ViewModel
var ViewModel = function() {
    var self = this;

    var Pointer = function (map, title, lat, lng, location, myData) {
        this.title = ko.observable(title);
        this.lat = ko.observable(lat);
        this.lng = ko.observable(lng);
        this.myData = ko.observable(myData);

        this.marker = new google.maps.Marker({
            map: map,
            position: new google.maps.LatLng(lat, lng),
            icon: imageMarker,
            animation: google.maps.Animation.DROP,
        });
    };

    google.maps.event.addListener(map, 'click', function() {
        infowindow.close();
    });

    self.touristicAttractions = ko.observableArray(places);

    self.filter = ko.observable('');

    imageMarker = 'img/marker.png';

    for (i = 0; i < places.length; i++){
        // Get the position from the location array
        self.touristicAttractions()[i].pointer = new Pointer (map, self.touristicAttractions()[i].title, self.touristicAttractions()[i].lat, self.touristicAttractions()[i].lng, self.touristicAttractions()[i].myData);

        var content = self.touristicAttractions()[i].pointer.myData;
        var heading = self.touristicAttractions()[i].pointer.title();

        marker = self.touristicAttractions()[i].pointer.marker;



        // Show infowindow when it receives the click
        marker.addListener('click', function(pointer) {
            infowindow.open(map, pointer.marker);
            self.showInfoWindow(this, infowindow);
            self.getWiki(heading, infowindow);
        });

        // Animate marker when map marker is clicked on
        marker.addListener('click', function() {
            this.setAnimation(google.maps.Animation.BOUNCE);
            var mark = this;
            setTimeout(function(){
                mark.setAnimation(null);
            }, 700);
        });
    }

    self.markers = [];

    self.getWiki = function(heading, infowindow) {
        var linkPlaces = heading;
        var wikiUrl =  'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + linkPlaces + '&format=json&callback=wikiCallback';

        var wikiRequestTimeout = setTimeout(function() {
            $wikiElem.text("Failed to get wikipedia resources");
        },8000);


        $.ajax({
        url: wikiUrl,
        dataType: "jsonp",
        // ajax settings
            success: function (response) {
                console.log(response);
                var articleStr = response[0];
                var url = 'http://en.wikipedia.org/wiki/' + articleStr;

                content = url;
                infowindow.setContent('<h2>' + linkPlaces + '</h2>' + '<a class="content" href="' + content + '">' + 'Wikipedia Link to ' +
                      linkPlaces + '</a>');
            }
        });
        clearTimeout(wikiRequestTimeout);
    };

    // Filter the listview based on the search keywords
    self.filteredAttractions = ko.computed(function(){
         // Filter the touristicAttractions() array using a function that calls each attraction
        return ko.utils.arrayFilter(self.touristicAttractions(), function(attraction){
            var match = attraction.title.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0;
            // console.log(match);
            if (match) {
              // set encapsulated marker to be visible
              attraction.pointer.marker.setVisible(match);
              //self.filter.push(attraction);
            } else {
              // otherwise set it to be false
              attraction.pointer.marker.setVisible(match);
            }
            return match;
            });
        });

    // Open the infowindow and animate on each marker
    self.setPlace = function(clickedMarker) {
        //console.log(clickedMarker);
        for (var i = 0; i < self.touristicAttractions().length; i++) {
            self.touristicAttractions()[i].marker.setAnimation(null);
        }
        self.showInfoWindow(clickedMarker.marker, infowindow);
    };

    // Create the infowindow on each marker
    self.showInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            infowindow.setContent("<img class='imageinfo' src=" + marker.image + ">" + '<h2>' + marker.title + '</h2>' + '<div class="content">' + marker.content + '</div>' + '<a href="https://en.wikipedia.org/wiki/' + marker.link +' " >More info</a>');
            infowindow.open(map, marker);
            infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function(){
            marker.setAnimation(null);
            }, 700);
        }
    };
};

// Menu Toggle Script
$("#menu-toggle").click(function(e) {
            e.preventDefault();
            $("#wrapper").toggleClass("toggled");
        });

// Error handling for the Google Map api. This will pop up alert advising user that map is unavailable.
var googleError = function() {
    alert('Unfortunately, Google Maps is currently unavailable.');
};

