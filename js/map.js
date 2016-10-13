// Model
// List of locations
var places = [
    {
        title: 'Alcatraz',
        content: 'Alcatraz Island is located in the San Francisco Bay, 1.25 miles offshore from San Francisco, California, United States.',
        location: {lat: 37.8270, lng: -122.4230},
        image: 'img/alcatraz.jpg',
        wiki: 'Alcatraz_Island',
        visible: true
    },{
        title: "Fisherman's Wharf",
        content:"Fisherman's Wharf is a neighborhood and popular tourist attraction in San Francisco, California. It roughly encompasses the northern waterfront area of San Francisco from Ghirardelli Square or Van Ness Avenue east to Pier 35 or Kearny Street.",
        location: {lat: 37.8080, lng: -122.4177},
        image: 'img/fishermans.jpg',
        wiki:'Fisherman%27s_Wharf,_San_Francisco',
        visible: true
    },{
        title: 'Golden Gate Bridge',
        content:'The Golden Gate Bridge is a suspension bridge spanning the Golden Gate strait, the one-mile-wide, three-mile-long channel between San Francisco Bay and the Pacific Ocean.',
        location: {lat: 37.8199, lng: -122.4783},
        image: 'img/goldengate.jpg',
        wiki:'Golden_Gate_Bridge',
        visible: true
    },{
        title: 'Union Square',
        content:'Union Square is a 2.6-acre public plaza bordered by Geary, Powell, Post and Stockton Streets in downtown San Francisco, California.',
        location: {lat: 37.7880, lng: -122.4074},
        image: 'img/unionsquare.jpg',
        wiki:'Union_Square,_San_Francisco',
        visible: true
    },{
        title: 'Lombard Street',
        content:'Lombard Street is an east–west street in San Francisco, California that is famous for a steep, one-block section with eight hairpin turns.',
        location: {lat: 37.8021, lng: -122.4187},
        image: 'img/lombard.jpg',
        wiki:'Lombard_Street_(San_Francisco)',
        visible: true
    },{
        title: 'Embarcadero',
        content:'The Embarcadero is the eastern waterfront and roadway of the Port of San Francisco, San Francisco, California, along San Francisco Bay.',
        location: {lat: 37.7993, lng: -122.3977},
        image: 'img/embarcadero.jpg',
        wiki:'Embarcadero_(San_Francisco)',
        visible: true
    }];

var map;

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

    self.markers = [];

    self.touristicAttractions = ko.observableArray(places);

    self.filter = ko.observable('');

    imageMarker = 'img/marker.png';

    for (var i = 0; i < places.length; i++){
        // Get the position from the location array
        var position = places[i].location;
        var image = places[i].image;
        var title = places[i].title;
        var content = places[i].content;
        var wiki = places[i].wiki;
        var visible = places[i].visible;
        // Create a marker per location, and put into markers array
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            image: image,
            title: title,
            content: content,
            visible: visible,
            wiki: wiki,
            show: ko.observable(true),
            icon: imageMarker,
            animation: google.maps.Animation.DROP,
            id: i
        });

        // Push the marker to our array of markers
        self.touristicAttractions()[i].marker = marker;

        // Show infowindow when it receives the click
        marker.addListener('click', function() {
            self.showInfoWindow(this, infowindow);
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

    // Filter the listview based on the search keywords
    self.filteredAttractions = ko.computed(function(){
         // Filter the touristicAttractions() array using a function that calls each attraction
        return ko.utils.arrayFilter(self.touristicAttractions(), function(attraction){
            var match = attraction.title.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0;
            // console.log(match);
            if (match) {
              // set encapsulated marker to be visible
              attraction.marker.setVisible(match);
            } else {
              // otherwise set it to be false
              attraction.marker.setVisible(match);
            }
            return match;
            } );
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
            infowindow.setContent("<img class='imageinfo' src=" + marker.image + ">" + '<h2>' + marker.title + '</h2>' + '<div class="content">' + marker.content + '</div>' + '<a href=" '+ self.wikiLink() +' " >More info</a>');
            infowindow.open(map, marker);
            infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function(){
            marker.setAnimation(null);
            }, 700);
        }
    };

    self.wikiLink = function(marker) {
        var wikiTitle = self.touristicAttractions().wiki;
        var wikiUrl = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' + wikiTitle + '&format=json&callback=wikiCallback';
        var wikiRequestTimeout = setTimeout(function() {
           alert ("Unfortunately, Wikipedia is unavailable. Please try again later.");
         }, 5000);

        $.ajax({
            url: wikiUrl,
            dataType: "jsonp",
            //jsonp: "callback",
            success: function(response) {
                var locationsList = response[1];
                for (var i = 0; i < locationsList.length; i++) {
                    locationsStr = locationsList[i];
                    var url = 'http://en.wikipedia.org/wiki/' + locationsStr;
                }
            }
        });
        clearTimeout(wikiRequestTimeout);
    };

    self.googleError = function() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
    };

};

