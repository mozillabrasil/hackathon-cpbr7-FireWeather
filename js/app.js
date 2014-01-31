var db;
var FireWeather = {
    selected:null,
    dataset:[],
    defaultLocation:null,
    timeoutId:0,
    geonameUsername:'michelwilhelm',
    defaultLang:'en',
    database:'FireWeather',
    dbRequest:null,
    conection:null,
    indexedDB:{},
    db:{
        DB_STORE_NAME : "Locations",
        DB_NAME       : "FireWeather",
        DB_VERSION    : 1,
        db            : null,

        getObjectStore:function(sysid) 
        {   
            var tx = FireWeather.db.db.transaction(store_name, mode);
            return tx.objectStore(store_name);
        },

        clearObjectStore:function(sysid) 
        {
        },

        getBlob:function(key, store, success_callback) 
        {
        },

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
        },

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
                    FireWeather.loadForecast(this)
                });

                var li = $('<li></li>').attr({
                    id:'li_'+value.sysid
                }).append(a);

                $('#locationList').append(li);
            }
        }
    },

    loadForecast:function(o)
    {
        $('#mainContent')
            .html('')
            .addClass('loading')
            .append($('<progress></progress>').addClass('progress'));

        $('#locationName').html($(o).attr('data-name')+'/'+$(o).attr('data-country'));
    },

    init:function()
    {
        FireWeather.updateLocationList();

        if (FireWeather.defaultLocation==null) {

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
                      })

                      $('#searchExec').click(function(){
                        FireWeather.geonamesSearch()
                      });
                  }
              }
            };
            xhr.send(null);
        }
    },
    addToMyList:function(o)
    {
        $('#locationName').html($(o).attr('data-name')+'/'+$(o).attr('data-country'));

        //addLocation:function(name, country, sysid, lat, lng)
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
                    'data-name':v.adminName2,
                    'data-lat':parseFloat(v.lat),
                    'data-lng':parseFloat(v.lng),
                    'data-sysid':v.adminId2,
                    'href':'javascript:;'
                  });
                  a.append($('<p></p>').html(v.adminName2));
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