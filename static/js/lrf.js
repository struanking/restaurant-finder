/*jslint indent: 2, vars: true, passfail: false */
/*globals LRF, alert, console, document, window, setTimeout, confirm, google, ActiveXObject, XMLHttpRequest, navigator */

var LRF = (function () {
  "use strict";

  var defaults = {
      currentLocationIcon: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
      lat: -0.08,
      lon: 51.5,
      dataType: 'json',
      mapTypeId: 'roadmap',
      searchUrl: 'query',
      zoom: 10,
      distanceUnit: 'miles',
      locationPlaceholderText: 'Enter location e.g. postcode...',
      showOptions: 'Show options',
      hideOptions: 'Hide options'
    },
    map,
    markers = [],
    infoWindow,
    locationSelect;

  function detectHtml5FormSupport(type) {
    var input = document.createElement("input");
    input.setAttribute('type', type);
    return input.type !== 'text';
  }

  function generateLatLng(lat, lon) {
    return new google.maps.LatLng(parseFloat(lat), parseFloat(lon));
  }

  function createMarker(latlng, name, address, icon) {
    var html = "<h2>" + name + "</h2>" + address,
      marker = new google.maps.Marker({
        icon: icon || null,
        map: map,
        position: latlng
      });
    google.maps.event.addListener(marker, 'click', function () {
      infoWindow.setContent(html);
      infoWindow.open(map, marker);
    });
    markers.push(marker);
  }

  function createOption(name, distance, num) {
    var option = document.createElement("option");
    option.value = num;
    option.innerHTML = name + " (" + distance.toFixed(2) + ")";
    locationSelect.appendChild(option);
  }

  function handleShowHide() {
    var button = document.getElementById('expand'),
      finder = document.getElementById('finder');
    if (!button) {
      return;
    }

    if (button.className === 'remove') {
      finder.className = 'hide';
      button.className = 'reveal';
      button.innerHTML = defaults.showOptions;
    } else {
      finder.className = 'show';
      button.className = 'remove';
      button.innerHTML = defaults.hideOptions;
    }
    return true;
  }

  function disableUseCurrentLocation() {
    var elem = document.getElementById('current-location'),
      form = document.getElementById('finder');

    if (elem && LRF.config.useCurrentLocation) {
      elem.parentNode.removeChild(elem);
      document.getElementById('address').placeholder = defaults.locationPlaceholderText;
    }

    if (form && form.className !== 'show') {
      handleShowHide();
    }

    LRF.config.useCurrentLocation = false;
  }

  function currentLocationMarkup() {
    if (!document.getElementById('current-location')) {
      var elem = document.createElement('section');
      elem.id = 'current-location';
      elem.innerHTML = '<img alt="Current location marker" title="Your current location" src="' + defaults.currentLocationIcon + '"/>' +
        '<span>Is your current location.</span>' +
        '<button onclick="LRF.disableUseCurrentLocation(); return false;">' +
        'Don\'t use current location' +
        '</button>' +
        '<span id="hide" title="dismiss">x</span>';
      document.getElementById('map').appendChild(elem);
    }
    document.getElementById('address').placeholder = 'Using current location';
    document.getElementById('hide').onclick = function () {
      LRF.hide(this.parentNode);
      return false;
    };
  }

  function clearLocations() {
    var i;
    if (infoWindow) {
      infoWindow.close();
    }

    for (i = LRF.config.useCurrentLocation ? 1 : 0; i < markers.length; i += 1) {
      markers[i].setMap(null);
    }

    markers.length = LRF.config.useCurrentLocation ? 1 : 0;
    
    locationSelect = document.getElementById("locationSelect");
    locationSelect.innerHTML = "";
    var option = document.createElement("option");
    option.value = "none";
    option.innerHTML = "All results (" + defaults.distanceUnit + "):";
    locationSelect.appendChild(option);
  }

  function drawMap(data) {
    var i = 0,
      bounds = new google.maps.LatLngBounds(),
      restaurant,
      name,
      address,
      distance,
      latlng;

    data.forEach(function (record) {
      restaurant = record.obj;
      name = restaurant.name;
      address = restaurant.address;
      distance = parseFloat(record.dis);
      latlng = generateLatLng(restaurant.loc.lat, restaurant.loc.lon);

      i += 1;
      //createOption(name, distance, i);
      createMarker(latlng, name, address);
      bounds.extend(latlng);
    });

    map.fitBounds(bounds);
    
    /*
    locationSelect.style.visibility = "visible";
    locationSelect.onchange = function () {
      var markerNum = locationSelect.options[locationSelect.selectedIndex].value;
      google.maps.event.trigger(markers[markerNum], 'click');
    };
    */
    setTimeout(handleShowHide, 750);
  }

  function requestLocations(center) {
    var radius = document.getElementById("radius").value,
      maxResults = document.getElementById("maxResults").value,
      lat = LRF.config.useCurrentLocation ? LRF.config.currentCenter.lat : center.lat(),
      lon = LRF.config.useCurrentLocation ? LRF.config.currentCenter.lon : center.lng(),
      searchUrl = defaults.searchUrl + '/' + lon + '/' + lat + '/' + radius + '/' + maxResults,
      request = window.ActiveXObject ? new ActiveXObject('Microsoft.XMLHTTP') : new XMLHttpRequest();

    //clearLocations();

    request.onreadystatechange = function () {
      if (request.readyState === 4 && request.status === 200) {
        request.onreadystatechange = '';
        drawMap(JSON.parse(request.responseText));
      }
    };
    request.open('GET', searchUrl, true);
    request.send(null);
  }

  function displayCurrentLocation(position) {
    var autoSearch = confirm('Using your current location the search can be run automatically? \nYou can always reset this later.'),
      currentCenter,
      latlng;

    if (autoSearch) {
      console.log('Latitude: ' + position.coords.latitude + ', Longitude: ' + position.coords.longitude);
      currentCenter = LRF.config.currentCenter;
      currentCenter.lat = position.coords.latitude;
      currentCenter.lon = position.coords.longitude;
      LRF.config.useCurrentLocation = true;
      latlng = generateLatLng(currentCenter.lat, currentCenter.lon);
      createMarker(latlng, 'Your current location', '', defaults.currentLocationIcon);
      currentLocationMarkup();
      requestLocations();
    }
  }

  function loadMap() {
    console.log('Loading Map');
    map = new google.maps.Map(document.getElementById("map"), {
      center: new google.maps.LatLng(defaults.lon, defaults.lat),
      zoom: defaults.zoom,
      mapTypeId: 'roadmap',
      mapTypeControlOptions: {style: google.maps.MapTypeControlStyle.DROPDOWN_MENU}
    });
    infoWindow = new google.maps.InfoWindow();
  }

  function displayError(error) {
    var errors = {
      1: 'Permission denied',
      2: 'Position unavailable',
      3: 'Request timeout'
    };
    console.log("Error: " + errors[error.code]);
  }

  function currentLocation() {
    if (!navigator.geolocation) {
      return;
    }
    var timeoutVal = 10 * 1000 * 1000;
    navigator.geolocation.getCurrentPosition(
      displayCurrentLocation,
      displayError,
      {enableHighAccuracy: true, timeout: timeoutVal, maximumAge: 0}
    );
  }

  function search() {
    var address = document.getElementById('address'),
      center,
      geocoder,
      latlng;

    if (LRF.config.useCurrentLocation && address.value !== '') {
      console.log('disabling current location');
      disableUseCurrentLocation();
    }

    if (!LRF.config.useCurrentLocation && address.value === '') {
      alert('Please enter a location.');
      address.focus();
      return;
    }

    if (LRF.config.useCurrentLocation) {
      requestLocations();
    } else {
      geocoder = new google.maps.Geocoder();
      geocoder.geocode({address: address.value}, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK) {
          center = results[0].geometry.location;
          latlng = generateLatLng(center.lat(), center.lng());
          requestLocations(center);
          createMarker(latlng, 'Your chosen location', '', defaults.currentLocationIcon);
        } else {
          alert('Sorry, ' + address + ' not found.');
        }
      });
    }
  }

  function setUpShowHide() {
    if (document.getElementById('expand')) {
      return;
    }

    var elem = document.createElement('button');
    elem.innerHTML = defaults.hideOptions;
    elem.id = 'expand';
    elem.className = 'remove';
    elem.onclick = function () {
      handleShowHide();
      return false;
    };
    document.querySelector('.search').insertBefore(elem, document.getElementById('search'));
  }

  function updateSliderUI(event) {
    var event = event || window.event,
      src = event.target || event.srcElement,
      sliderId = src.id,
      UI = document.getElementById(sliderId + '-ui');

    if (UI) {
      UI.innerHTML = src.value;
      return true;
    }
  }

  function sliderEvent(slider) {
    var doc = document,
      sliderId = slider.id;

    if (!detectHtml5FormSupport('range')) {
      slider.type = 'text';
      document.getElementById(sliderId + '-ui').style.display = 'none';
      return;
    } 

    if (doc.addEventListener) {
      slider.addEventListener('change', updateSliderUI, false);
    } else if (doc.attachEvent) {
      slider.attachEvent('onchange', updateSliderUI);
    } else {
      slider.onchange = updateSliderUI;
    }
  }

  function setSlider() {
    var i,
      sliders = document.querySelectorAll('input[type="range"]');

    for (i = 0; i < sliders.length; i += 1) {
      sliderEvent(sliders[i]);
    }
  }

  function hideAddressBar() {
    setTimeout(function () {
      window.scrollTo(0, 1);
    }, 10);
  }

  function hideField(field) {
    if (field) {
      field.className = 'hide';
    }
    return true;
  }

  function fillScreen() {
    var doc = document,
      docWidth = doc.body.clientWidth,
      bodyHeight = window.innerHeight,
      formHeight = doc.querySelector('header').offsetHeight,
      mapHeight = bodyHeight - 2.1 * formHeight;

    doc.getElementById('map').style.height = +mapHeight + 'px';
    doc.getElementById('search').onclick = function () {
      LRF.searchLocations();
      return false;
    };
  }

  function init() {
    document.documentElement.classList.remove('no-js');
    fillScreen();
    hideAddressBar();
    currentLocation();
    loadMap();
    setUpShowHide();
    setSlider();
  }

  return {
    config: {
      useCurrentLocation: false,
      currentCenter: []
    },
    init: init,
    searchLocations: search,
    disableUseCurrentLocation: disableUseCurrentLocation,
    updateSliderUI: updateSliderUI,
    hide: hideField,
    fillScreen: fillScreen
  };
})();

document.addEventListener("DOMContentLoaded", LRF.init);

window.addEventListener("orientationchange", function() {
  LRF.fillScreen();
}, false);