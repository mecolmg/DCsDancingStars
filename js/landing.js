var host = "https://dcs-dancing-stars-gala.azurewebsites.net/";
var campaigns = [];
var fundraisers = [];

$.ajax({
    type: "GET",
    url: host + "campaigns",
    dataType: 'json',
    success: function(data) {
     campaigns = data.campaigns;
      var totalRaised = 0;
      for(var i=0; i < campaigns.length; i++){
        if(campaigns[i].state !== 'archived'){
          totalRaised += campaigns[i].amount_raised;
        }
        if(campaigns[i].id === 3626){
          $('#celebrities-raised').html('$'+numberWithCommas(campaigns[i].amount_raised));
        } else if(campaigns[i].id === 3627){
          $('#professionals-raised').html('$'+numberWithCommas(campaigns[i].amount_raised));
        } else if(campaigns[i].id === 3628){
          $('#corp-raised').html('$'+numberWithCommas(campaigns[i].amount_raised));
        }
      }
      $('.total-raised').html('$'+numberWithCommas(totalRaised));
    },
    error : function(jqXHR, textStatus, errorThrown) {
    },
    timeout: 120000
});

$.ajax({
    type: "GET",
    url: host + "fundraisers",
    dataType: 'json',
    success: function(data) {
        for(var i=0; i<data.fundraisers.length; i++){
            if(!data.fundraisers[i].archived){
                fundraisers.push(data.fundraisers[i]);
            }
        }

        fundraisers.sort(function(a,b){
            var aVal = a.amount_raised_in_cents;
            var bVal = b.amount_raised_in_cents;
            return ((aVal > bVal) ? -1 : ((aVal < bVal) ? 1 : 0));
        });

        $(document).ready(function(){
            var permalink = window.location.hash.substring(1);
            if(getFundraiser(permalink) !== null){
                openViewMore(permalink);
            }
        });
    },
    error : function(jqXHR, textStatus, errorThrown) {
    },
    timeout: 120000
});

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getFundraiser(id){
    for(var i=0; i<fundraisers.length; i++){
        if(fundraisers[i].id === id || fundraisers[i].permalink === id)
            return fundraisers[i];
    }
    return null;
};

function openDialog(id){
    var fnd = getFundraiser(id);
    $('#formDialog').css('width','450px');
    var form =
        "<h4 id='form-dialog-title' class='mdl-dialog__title' style='padding: 12px 6px;'></h4>" +
        "<scr"+"ipt " +
                "src='https://www.dntly.com/assets/js/v1/form.js' " +
                "type='text/javascript' " +
                "data-donately-address='true' " +
                "data-donately-id='act_db6f79c68de8' " +
                "data-donately-campaign-id='"+fnd.campaign_id+"' " +
                "data-stripe-publishable-key='pk_live_F1qPdCs0uBdkOptbCd35jLUo' " +
                "data-donately-duration='only_onetime' " +
                "data-donately-amount='500' " +
                "data-donately-presets='250,500,1000,1500,2000' " +
                "data-donately-fundraiser-id='"+fnd.id+"' " +
                "data-donately-anonymous='true'" +
          "></scr"+"ipt>";
    $('#form-dialog-content').html(form);
    $('#form-dialog-title').html(fnd.title);
    $(document).ready(function(){
        // $('body').addClass('dialog-open');
        // document.querySelector('#formDialog').showModal();
        $('#formDialog').openModal();
    });
};

function openViewMore(identifier){
    $('#dialog').css('width','90%');
    var fnd = getFundraiser(identifier);
    var id = fnd.id;
    var donations = [];
    var template =
    "<div class='mdl-grid'>" +
        "<div class='mdl-cell mdl-cell--8-col'>" +
            "<h4 id='dialog-title' class='mdl-dialog__title' style='padding: 12px 0px;'>"+fnd.title+"</h4>" +
            "<p>" + fnd.description.replace(/\n/g,"<br>") + "</p>" +
        "</div>" +
        "<div class='mdl-cell mdl-cell--4-col'>" +
            "<div style='width:100%; background: url("+fnd.photo.original+") center/cover;max-height:500px'>"+
                "<img id='dialog-image' style='width:100%;opacity:0;' src='"+fnd.photo.original+"'>"+
            "</div>" +
            "<div class='mdl-progress-container mdl-card--border'>" +
              "<div class='progress-text'>" +
                  "<span class='funds-raised'>"+
                       fnd.amount_raised_formatted.slice(0,-3)+
                       "/"+
                       fnd.goal_formatted.slice(0,-3)+
                  "</span><span> Raised</span>" +
              "</div>" +
              "<div id='progress-"+id+"' class='mdl-progress'>"+
                   "<div class='progressbar bar bar1' style='width: "+(fnd.amount_raised/fnd.goal*100)+"%;'></div>"+
                   "<div class='bufferbar bar bar2' style='width: 100%;'></div>"+
              "</div>" +
            "</div>" +
          "<button id='show-dialog-"+id+"' class='mdl-button mdl-button--raised mdl-button--colored mdl-js-button mdl-js-ripple-effect' onclick='openDialog("+id+")'>Vote Now</button>" +
          "<div style='border-radius:10px;margin-top:20px;overflow:hidden;' id='donation-container'>" +
          "</div>" +
        "</div>" +
    "</div>";
    $('#dialog-content').html(template);
    $.ajax({
        type: "GET",
        url: host + "donations/" + id,
        dataType: 'json',
        success: function(data) {
          for(var i=0; i<data.donations.length; i++){
            if(true){
                donations.push(data.donations[i]);
            }
          }
          var donorTemplate = "";
          if(donations.length > 0){
            donorTemplate +=
              "<div style='background:#333; width: 100%;color:white;padding:10px; max-height:200px; overflow-y:auto;'>" +
                "<b style='font-size:24px;line-height:normal;'>Donor Leaderboard</b>";

            for(var i=1; i<=donations.length; i++){
              donorTemplate += "<div>" + i + ". ";
              if(!donations[i-1].anonymous) {
                if(donations[i-1].on_behalf_of === null || donations[i-1].on_behalf_of === ""){
                  donorTemplate += donations[i-1].full_name_or_email;
                } else {
                  donorTemplate += donations[i-1].on_behalf_of;
                }
              } else {
                donorTemplate += "Anonymous";
              }
              donorTemplate += " (" + donations[i-1].amount_formatted + ")</div>";
            }

            donorTemplate += "</div>";
            $('#donation-container').html(donorTemplate);
          }

        },
        error : function(jqXHR, textStatus, errorThrown) {
        },
        timeout: 120000
    });
    $('#dialog-image').load(function(){
        $('#dialog').openModal();
    });
};

// function openViewMore(identifier){
//     $('#dialog').css('width','90%');
//     var fnd = getFundraiser(identifier);
//     var id = fnd.id;
//     var template =
//     "<div class='mdl-grid'>" +
//         "<div class='mdl-cell mdl-cell--8-col'>" +
//             "<h4 id='dialog-title' class='mdl-dialog__title' style='padding: 12px 0px;'>"+fnd.title+"</h4>" +
//             "<p>" + fnd.description.replace(/\n/g,"<br>") + "</p>" +
//         "</div>" +
//         "<div class='mdl-cell mdl-cell--4-col'>" +
//             "<div style='width:100%; background: url("+fnd.photo.original+") center/cover;max-height:500px'>"+
//                 "<img id='dialog-image' style='width:100%;opacity:0;' src='"+fnd.photo.original+"'>"+
//             "</div>" +
//             "<div class='mdl-progress-container mdl-card--border'>" +
//               "<div class='progress-text'>" +
//                   "<span class='funds-raised'>"+
//                        fnd.amount_raised_formatted.slice(0,-3)+
//                        "/"+
//                        fnd.goal_formatted.slice(0,-3)+
//                   "</span><span> Raised</span>" +
//               "</div>" +
//               "<div id='progress-"+id+"' class='mdl-progress'>"+
//                    "<div class='progressbar bar bar1' style='width: "+(fnd.amount_raised/fnd.goal*100)+"%;'></div>"+
//                    "<div class='bufferbar bar bar2' style='width: 100%;'></div>"+
//               "</div>" +
//             "</div>" +
//           "<button id='show-dialog-"+id+"' class='mdl-button mdl-button--raised mdl-button--colored mdl-js-button mdl-js-ripple-effect' onclick='openDialog("+id+")'>Vote Now</button>" +
//         "</div>" +
//     "</div>";
//     $('#dialog-content').html(template);
//     $('#dialog-image').load(function(){
//         $('#dialog').openModal();
//     });
// };

$('#formDialog')
.on('keydown', function(evt) {
    if (evt.keyCode === 27) {
        $('body').removeClass('dialog-open');
        document.querySelector("#formDialog").close();
        evt.stopPropagation();
    }
});

$('#dialog')
.on('keydown', function(evt) {
    if (evt.keyCode === 27) {
        $('body').removeClass('dialog-open');
        document.querySelector("#dialog").close();
        evt.stopPropagation();
    }
});

$(document).ready(function() {
  $('.modal-trigger').leanModal();
});
