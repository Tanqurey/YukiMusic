$(function () {
    var objCity = new BMap.LocalCity();
    console.log(objCity)
    objCity.get(function (res) {
        var city = res.name
        console.log(city)
        $('.city').eq(0).html(`您的城市：` + city)
        $('#cityName').val(city)
        weather(city)
    })

    $('#weatherQuery').eq(0).click(function () {
        $('.city').eq(0).html(`您的城市：` + $('#cityName').val())
        weather($('#cityName').val())
        $('#cityName').val('')
    })


    //天气查询
    function weather(city) {
    $.ajax({
        type: 'get',
        dataType: 'json',
        success: function (result) {
            var res = result.HeWeather6[0]
            var weaTem = '<ul class="outer-ul">' +
                '{{each daily_forecast value}}' +
                '<li>' +
                '<ul class="inner-ul">' +
                '<li>' +
                '{{value.date}}' +
                '</li>' +
                '<li>' +
                '早间天气：'+
                '{{value.cond_txt_d}}' +
                '</li>' +
                '<li>' +
                '晚间天气：'+
                '{{value.cond_txt_n}}' +
                '</li>' +
                '</ul>' +
                '</li>' +
                '{{/each}}' +
                '</ul>'
            var render = template.compile(weaTem)
            var newWea = render(res)
            $('.showWeather').eq(0).html(newWea)
        },
        url: 'https://free-api.heweather.net/s6/weather/forecast?parameters',
        data: {
            location: city,
            key: '589e5ab5488e49d9bd04947cd7f79ea8'
        },
        error: function (err) {

        }
    })

    }
  

})