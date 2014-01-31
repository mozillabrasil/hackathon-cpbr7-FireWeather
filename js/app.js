var db;
var FireWeather = {
    selected:null,
    dataset:[],
    defaultLocation:null,
    timeoutId:0,
    geonameUsername:'michelwilhelm',
    defaultLang:'en',
    db:{
        DB_STORE_NAME : "Locations",
        DB_NAME       : "FireWeather",
        DB_VERSION    : 1,
        db            : null,

        addLocation:function(name, country, sysid, lat, lng)
        {
            var ret = null;
            var obj = {
                'name' : name,
                'country' : country,
                'sysid': sysid,
                'lat': lat,
                'lng': lng
            }
            if (localStorage.Locations) {
                var json = $.parseJSON(localStorage.Locations);
                json.push(obj);
                localStorage.Locations = JSON.stringify(json);
            } else {
                json = [obj];
                localStorage.Locations = JSON.stringify(json);
            }
            FireWeather.updateLocationList();
            FireWeather.loadForecast($('a[data-sysid='+sysid+']'));
        },

    },

    loadSearchForm:function() 
    { 

        $('#btnDeleteLocation').hide();
        $('#locationName').html('Add a new location');

        var xhr = new XMLHttpRequest({
            mozSystem: true
        });

        xhr.open("GET", "source/searchTpl.html", true);
        xhr.onload = function (e) {
          if (xhr.readyState === 0) {
              $('#mainContent')
                .html('')
                .addClass('loading')
                .append($('<progress></progress>').addClass('progress'));
          } else if (xhr.readyState === 4) {
              if (xhr.status === 200) {
                  $('#mainContent').html(xhr.responseText);
                  
                  $('#searchClear').click(function(){
                    $('#search').val('');
                  });

                  $('#search').click(function(e){
                    window.location='#content';
                  }).keyup(function(e) {
                      var enterKey = 13;
                      if (e.which == enterKey){
                          FireWeather.geonamesSearch();
                      }
                  });

                  $('#searchExec').click(function(){
                    FireWeather.geonamesSearch()
                  });
              }
          }
        };
        xhr.send(null);
    },
    
    removeLocation:function(sysid)
    {
        var json = $.parseJSON(localStorage.Locations);
        for (i=0;i<json.length;i++) {
            if (json[i].sysid==sysid) {
              console.log('hue');
              json.splice(i, 1);
            }
        }
        localStorage.Locations = JSON.stringify(json);

        localStorage.removeItem("defaultLocation");
        FireWeather.updateLocationList();
        FireWeather.loadSearchForm();
        
        //window.location='#drawer';
    },

    updateLocationList:function()
    {
        
        if (localStorage.Locations) {
            Locations = $.parseJSON(localStorage.Locations);
            $('#locationList li').remove();
            for (i=0;i<Locations.length; i++) {
                var value = Locations[i];

                var a = $('<a></a>')
                .attr({
                    'data-country': value.country,
                    'data-name':value.name,
                    'data-lat':value.lat,
                    'data-lng':value.lng,
                    'data-sysid':value.sysid,
                    'href':'javascript:;'
                })
                .html(value.name+'/'+value.country)
                .click(function(e){
                    window.location='#content';
                    FireWeather.loadForecast(this)
                });

                var li = $('<li></li>').attr({
                    id:'li_'+value.sysid
                });

                li.append(a);
        

                $('#locationList').append(li);
            }
        }
    },

    loadForecast:function(o)
    {

        $('#btnDeleteLocation').show();
        localStorage.defaultLocation = $(o).attr('data-sysid');
        FireWeather.defaultLocation = localStorage.defaultLocation;
        
        $('#mainContent')
            .html('')
            .addClass('loading')
            .append($('<progress></progress>').addClass('progress'));

        $('#locationName').html($(o).attr('data-name')+'/'+$(o).attr('data-country'));

        FireWeather.getJSONP('http://api.worldweatheronline.com/free/v1/weather.ashx?q='+$(o).attr('data-lat')+','+$(o).attr('data-lng')+'&format=json&num_of_days=5&callback=?&key=ekwcg8tgm6y5t2bre925r9t5', function(response){
            if (response.data) {
                var condition = response.data.current_condition[0];
                var xhr = new XMLHttpRequest({
                    mozSystem: true
                });

                xhr.open("GET", "source/weatherTpl.html", true);
                xhr.onload = function (e) {
                  if (xhr.readyState === 4) {
                      if (xhr.status === 200) {
                          $('#mainContent').html(xhr.responseText);
                          
                          $('.weatherTpl .temp').html(condition.temp_C+'°');
                          $('.weatherTpl .image').css({
                              'background': 'url('+'icons/weather/'+condition.weatherCode+'.png'+') no-repeat 50% 50%',
                              'height' : '108px'
                          });
                          $('#cloudcover').val(condition.cloudcover);
                          $('#humidity').html(condition.humidity+"%");
                          $('#pressure').html(condition.pressure+"hPa");
                          $('#precipitation').html(condition.precipMM+"mm");
                          $('#wndDir').html(condition.winddir16Point);
                          $('#wndSpeed').html(condition.windspeedKmph + "Km/h");
                          $('#visibility').html(condition.visibility+"Km");

                          $('#btnDeleteLocation').attr({'data-sysid':$(o).attr('data-sysid')});
                      }
                  }
                };
                xhr.send(null);
            }
        });


    },

    init:function()
    {
        FireWeather.updateLocationList();

        $('#btnAddLocation').click(function(){
            FireWeather.loadSearchForm();
        });

        $('#btnDeleteLocation').click(function(){
            FireWeather.removeLocation($(this).attr('data-sysid'));
        });

        if (localStorage.defaultLocation != 'undefined') {
            FireWeather.loadForecast($('a[data-sysid='+localStorage.defaultLocation+']'));
        } else {
            FireWeather.loadSearchForm();
        }
    },
    addToMyList:function(o)
    {
        $('#locationName').html($(o).attr('data-name')+'/'+$(o).attr('data-country'));

        FireWeather.db.addLocation(
            $(o).attr('data-name'),
            $(o).attr('data-country'),
            $(o).attr('data-sysid'),
            $(o).attr('data-lat'),
            $(o).attr('data-lng')
            );
    },
    geonamesSearch:function(){
        $('#loadAutoComplete ul li').remove().append($('<progress></progress>').addClass('progress'));
        FireWeather.getJSONP('http://ws.geonames.org/searchJSON?featureClass=P&style=full&maxRows=5&name_startsWith='+$('#search').val()+'&username=michelwilhelm&callback=?',function(data){
          if (data.geonames) {

              $.each(data.geonames, function(i, v) {
                  var li = $('<li></li>');
                  var a = $('<a></a>')
                  .attr({
                    'data-country': v.countryName,
                    'data-name':v.name,
                    'data-lat':parseFloat(v.lat),
                    'data-lng':parseFloat(v.lng),
                    'data-sysid':v.geonameId,
                    'href':'javascript:;'
                  });
                  a.append($('<p></p>').html(v.name));
                  a.append($('<p></p>').html(v.countryName));
                  a.click(function(){
                      FireWeather.addToMyList(this);
                  });

                  li.append(a);

                  $('#loadAutoComplete ul').append(li);
                  
              });
          }
      });
    },
    getJSONP:function(url, success){
        $('#loadAutoComplete ul li').remove().append($('<progress></progress>').addClass('progress'));

        var ud = 'json'+(Math.random()*100).toString().replace(/\./g,'');
        window[ud]= function(o){
            success&&success(o);
        };
        document.getElementsByTagName('body')[0].appendChild((function(){
            var s = document.createElement('script');
            s.type = 'text/javascript';
            s.src = url.replace('callback=?','callback='+ud);
            return s;
        })());
    },

};

window.addEventListener("DOMContentLoaded", function(){
  FireWeather.init();
}, false);