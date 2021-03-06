var baseUrl = "https://www.dntly.com/api/v1/";
var siteUrl = "https://www.dcsdancingstarsgala.dntly.com/api/v1/";
var apiKey  = "7ebe3a1ac2e4596d7cb942948eda82a1";

var cors = "https://cors.io/?u=";
var host = "https://dcs-dancing-stars-gala.azurewebsites.net/";
var fundraisers = [];
var donations = [];

$.ajax({
    type: "GET",
    url: host + "fundraisers",
    dataType: 'json',
    success: function(data) {
        for(var i=0; i<data.fundraisers.length; i++){
            if(!data.fundraisers[i].archived){
                console.log(data.fundraisers[i]);
                fundraisers.push(data.fundraisers[i]);
            }
        }

        fundraisers.sort(function(a,b){
            var aVal = a.amount_raised_in_cents;
            var bVal = b.amount_raised_in_cents;
            return ((aVal > bVal) ? -1 : ((aVal < bVal) ? 1 : 0));
        });

        for(var i=0; i<fundraisers.length; i++){
            $("#leaderboard-content").html($('#leaderboard-content').html()+getLeaderboard(fundraisers[i]));
            $('#fundraisers').html($('#fundraisers').html()+getWidget(fundraisers[i]));
        }

        $(document).ready(function(){
            // var search = location.search.split("=");
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

// $.ajax({
//     type: "GET",
//     url: "https://www.dntly.com/api/v1/donations.json",
//     dataType: 'json',
//     beforeSend: function (xhr) {
//         xhr.setRequestHeader('Authorization', make_base_auth('b7b433ebd0c33c03e1f9cfcf63d9bd7f', ''));
//     },
//     success: function(data) {
//         for(var i=0; i<data.donations.length; i++){
//             if(true){
//                 donations.push(data.donations[i]);
//             }
//         }

//         donations.sort(function(a,b){
//             var aVal = a.amount_raised_in_cents;
//             var bVal = b.amount_raised_in_cents;
//             return ((aVal > bVal) ? -1 : ((aVal < bVal) ? 1 : 0));
//         });
//     },
//     error : function(jqXHR, textStatus, errorThrown) {
//     },
//     timeout: 120000
// });

function make_base_auth(user, password) {
    var tok = user + ':' + password;
    var hash = btoa(tok);
    return 'Basic ' + hash;
};

function getLeaderboard(fundraiser){
    return "<div class='leaderboard-item'>" + (fundraisers.indexOf(fundraiser)+1) + '. ' + fundraiser.title + " - " + fundraiser.amount_raised_formatted.slice(0,-3) + "</div>";
}

function getWidget(fundraiser){
    var id = fundraiser.id;
    var template =
        "<div id='"+id+"' class='mdl-cell mdl-cell--4-col mdl-cell--middle'>" +
           "<div class='demo-card-square mdl-card mdl-shadow--2dp'>" +
             "<div class='mdl-card__title mdl-card--expand' onclick='openViewMore("+id+")' style='background: linear-gradient(rgba(0, 0, 0, 0),rgba(0, 0, 0, 0.5)),url("+fundraiser.photo.original+") top / cover;'>" +
                 "<h2 class='mdl-card__title-text'>"+fundraiser.title+"</h2>" +
             "</div>" +
             "<div class='mdl-card__supporting-text'>"+fundraiser.description.replace(/\n/g,"<br>") +"</div>" +
             "<div class='mdl-progress-container mdl-card--border'>" +
               "<div class='progress-text'>" +
                   "<span class='funds-raised'>"+
                        fundraiser.amount_raised_formatted.slice(0,-3)+
                        "/"+
                        fundraiser.goal_formatted.slice(0,-3)+
                   "</span><span> Raised</span>" +
               "</div>" +
               "<div id='progress-"+id+"' class='mdl-progress'>"+
                    "<div class='progressbar bar bar1' style='width: "+(fundraiser.amount_raised/fundraiser.goal*100)+"%;'></div>"+
                    "<div class='bufferbar bar bar2' style='width: 100%;'></div>"+
               "</div>" +
             "</div>" +
             "<div class='mdl-card__actions mdl-card--border'>" +
               "<button id='view-more-" + id+"' class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' onclick='openViewMore("+id+")'>View More</button>" +
               "<button id='show-dialog-"+id+"' class='mdl-button mdl-button--colored mdl-js-button mdl-js-ripple-effect' onclick='openDialog("+id+")'>Vote Now</button>" +
             "</div>" +
           "</div>" +
       "</div>";
    return template;
};

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
    var fundDonations = [];
    for(var i=0; i<donations.length; i++){
      if(donations[i].fundraiser_id === id) fundDonations.push(donations[i]);
    }
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
          "<div style='display:none;margin-top:20px;background:black; border-radius:10px; width: 100%;color:white;padding:10px;'>" +
            "<b>Donor Leaderboard</b>";

    for(var i=1; i<=fundDonations.length; i++){
      console.log(fundDonations[i-1]);
      template += "<p>" + i + ". " + fundDonations[i-1].account_title + " (" + fundDonations[i-1].amount_formatted + ")</p>";
    }

    template = template +
          "</div>" +
        "</div>" +
    "</div>";
    $('#dialog-content').html(template);
    $('#dialog-image').load(function(){
        // $('body').addClass('dialog-open');
        // document.querySelector('#dialog').showModal();
        $('#dialog').openModal();
        // $('#dialog').animate({scrollTop:$('#dialog-title').offset().top-14},0);
    });
};

// function closeForm(){
//     $('body').removeClass('dialog-open');
//     document.querySelector('#formDialog').close();
// }

// function closeViewMore(){
//     $('body').removeClass('dialog-open');
//     document.querySelector("#dialog").close();
// }

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
