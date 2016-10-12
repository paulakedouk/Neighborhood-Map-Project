// Model

var places = [
    {
        title: 'Alcatraz',
        content: 'Alcatraz Island is located in the San Francisco Bay, 1.25 miles offshore from San Francisco, California, United States.',
        location: {lat: 37.8270, lng: -122.4230},
        image: 'img/alcatraz.jpg',
        link: 'https://en.wikipedia.org/wiki/Alcatraz_Island',
        visible: true
    },{
        title: "Fisherman's Wharf",
        content:"Fisherman's Wharf is a neighborhood and popular tourist attraction in San Francisco, California. It roughly encompasses the northern waterfront area of San Francisco from Ghirardelli Square or Van Ness Avenue east to Pier 35 or Kearny Street.",
        location: {lat: 37.8080, lng: -122.4177},
        image: 'img/fishermans.jpg',
        link:'https://en.wikipedia.org/wiki/Fisherman%27s_Wharf,_San_Francisco',
        visible: true
    },{
        title: 'Golden Gate Bridge',
        content:'The Golden Gate Bridge is a suspension bridge spanning the Golden Gate strait, the one-mile-wide, three-mile-long channel between San Francisco Bay and the Pacific Ocean.',
        location: {lat: 37.8199, lng: -122.4783},
        image: 'img/goldengate.jpg',
        link:'https://en.wikipedia.org/wiki/Golden_Gate_Bridge',
        visible: true
    },{
        title: 'Union Square',
        content:'Union Square is a 2.6-acre public plaza bordered by Geary, Powell, Post and Stockton Streets in downtown San Francisco, California.',
        location: {lat: 37.7880, lng: -122.4074},
        image: 'img/unionsquare.jpg',
        link:'https://en.wikipedia.org/wiki/Union_Square,_San_Francisco',
        visible: true
    }];

var map;

// Initiate the map
function initMap() {
    // Create a styles array to use with the map.
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

    this.markers = [];

    self.touristicAttractions = ko.observableArray(places);

    self.filter = ko.observable('');

    imageMarker = 'img/marker.png';

    for (var i = 0; i < places.length; i++){
        // Get the position from the location array
        var position = places[i].location;
        var image = places[i].image;
        var title = places[i].title;
        var content = places[i].content;
        var link = places[i].link;
        var visible = places[i].visible;
        // Create a marker per location, and put into markers array
        var marker = new google.maps.Marker({
            map: map,
            position: position,
            image: image,
            title: title,
            content: content,
            visible: visible,
            link: link,
            show: ko.observable(true),
            icon: imageMarker,
            animation: google.maps.Animation.DROP,
            id: i
        });

        // Push the marker to our array of markers
        self.touristicAttractions()[i].marker = marker;

        marker.addListener('click', function() {
            self.showInfoWindow(this, infowindow);
        })

        marker.addListener('click', function() {
            this.setAnimation(google.maps.Animation.BOUNCE);
            // 'mark' now refers to 'this' in this context.
            var mark = this;
            setTimeout(function(){
                mark.setAnimation(null);
            }, 700);
        });
    }

    self.filteredAttractions = ko.computed(function(){
        return ko.utils.arrayFilter(self.touristicAttractions(), function(attraction){
            var match = attraction.title.toLowerCase().indexOf(self.filter().toLowerCase()) >= 0;
            console.log(match);
            if (match) {
              // set encapsulated marker to be visible
              attraction.marker.setVisible(true);
            } else {
              // otherwise set it to be false
              attraction.marker.setVisible(false);
            }
            return match;
            } );
        });

    // We can access clickedMarker.marker directly for each location
    self.setPlace = function(clickedMarker) {
        //console.log(clickedMarker);
        for (var i = 0; i < self.touristicAttractions().length; i++) {
            self.touristicAttractions()[i].marker.setAnimation(null);
        }
        self.showInfoWindow(clickedMarker.marker, infowindow);
    };

    self.showInfoWindow = function(marker, infowindow) {
        // Check to make sure the infowindow is not already opened on this marker.
        if (infowindow.marker != marker) {
            infowindow.marker = marker;
            // Infowindow layout was taken and modified from GauthamRajesh on GitHub
            infowindow.setContent("<img class='imageinfo' src=" + marker.image + ">" + '<h2>' + marker.title + '</h2>' + '<div class="content">' + marker.content + '</div>' + '<a href=" '+ marker.link +' " >More info</a>');
            infowindow.open(map, marker);
            infowindow.marker.setAnimation(google.maps.Animation.BOUNCE);

            setTimeout(function(){
            marker.setAnimation(null);
            }, 700);
        }
    };
};

