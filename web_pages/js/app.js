function updateTemp() {
 	$.ajax({
         url: "http://localhost:8080/api/temperature",
         type: "GET"
     }).then(function(data) {
        $('.temp_atual').text(data.temperature + ' ˚C');
        $('.last_update').text('Ultima Atualizacao em '+ data.lastUpdate);
     });
}