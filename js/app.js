
var FireWeather = {
    selected:null,
    dataset:[],
    defaultLocation:null,
    timeoutId:0,
    geonameUsername:'michelwilhelm',

    init:function()
    {
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

    geonamesSearch:function(){
        FireWeather.getJSONP('http://ws.geonames.org/searchJSON?featureClass=P&style=full&maxRows=10&name_startsWith='+$('#search').val()+'&username=michelwilhelm&callback=?',function(data){
          if (data.geonames) {
              $.each(data.geonames, function(i, v) {
                  var name = "";
                  $.each(v.alternateNames, function(index, value){

                  });
                  console.log(v);
              });
          }
      });
    },
    setAutoLocation:function(c)
    {
        
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
$(document).ready(function(){
  FireWeather.init();
});
