console.log(window.web3);
var web3 = window.web3;
if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
    console.log("Metamask detected");
} else {
    alert("The plugin Metamask is not installed. Please visit https://metamask.io/ and reload the page after the installation.");
}
console.log(web3);
console.log(web3.isConnected());
//0x093fb362b84eca8b6222dc5f34738b062f4ca903
console.log("Init Contract")
var simplechatContract = web3.eth.contract([{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"messageList","outputs":[{"name":"sender","type":"address"},{"name":"message","type":"string"},{"name":"blockNumber","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getSizeList","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_message","type":"string"}],"name":"sendChat","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor"}]);
var simpleChatAddr = simplechatContract.at("0x093fb362b84eca8b6222dc5f34738b062f4ca903");


var me = {};
me.avatar = "https://lh6.googleusercontent.com/-lr2nyjhhjXw/AAAAAAAAAAI/AAAAAAAARmE/MdtfUmC0M4s/photo.jpg?sz=48";

var you = {};
you.avatar = "https://a11.t26.net/taringa/avatares/9/1/2/F/7/8/Demon_King1/48x48_5C5.jpg";        

//-- No use time. It is a javaScript effect.
function insertChat(who, text, from, block){
    var control = "";
    
    if (who == "me"){
        control = '<li style="width:100%">' +
                        '<div class="msj macro">' +
                        '<div class="avatar"><img class="img-circle" style="width:100%;" src="'+ me.avatar +'" /></div>' +
                            '<div class="text text-l">' +
                                '<p>'+ text +'</p>' +
                                '<p><small>from: '+from+' & blockNumber: '+block+'</small></p>' +
                            '</div>' +
                        '</div>' +
                    '</li>';                    
    }else{
        control = '<li style="width:100%;">' +
                        '<div class="msj-rta macro">' +
                            '<div class="text text-r">' +
                                '<p>'+text+'</p>' +
                                '<p><small>from: '+from+' & blockNumber: '+block+'</small></p>' +
                            '</div>' +
                        '<div class="avatar" style="padding:0px 0px 0px 10px !important"><img class="img-circle" style="width:100%;" src="'+you.avatar+'" /></div>' +                                
                  '</li>';
    }
    $("ul").append(control).scrollTop($("ul").prop('scrollHeight'));
}

function resetChat(){
    $("ul").empty();
}

$(".mytext").on("keydown", function(e){
    if (e.which == 13){
        var text = $(this).val();
        if (text !== ""){

            simpleChatAddr.sendChat.sendTransaction(text, {
                from: web3.eth.accounts[0],
                gas: 420000 },
                function(error, transactionHash) {
                    if(error) {
                        alert(error);
                        $(this).val('');
                    } else {
                        console.log(transactionHash);
                    }
                }
            );
        }
    }
});

$('body > div > div > div:nth-child(2) > span').click(function(){
    $(".mytext").trigger({type: 'keydown', which: 13, keyCode: 13});
})

//-- Clear Chat
resetChat();

var messageList = new Array();
var lastMessage=0;

function addMessageToList(chat, sizeList) {
    messageList.push(chat);
    if(messageList.length==sizeList) {
        displayAllRemainingMessage();
    }
}

function displayAllRemainingMessage() {
    messageList.sort(function compare(a,b) {
        return a[2]-b[2];
    });
    for(var i=lastMessage;i<messageList.length;i++) {
        console.log(messageList);
        var chat = messageList[i];
        var address = chat[0];
        if (address==web3.eth.accounts[0]) {
            insertChat("me", chat[1], chat[0], chat[2]);
        } else {
            insertChat("you", chat[1], chat[0], chat[2]);
        }
        lastMessage+=1;
    }
}

function getAllMessage() {
    simpleChatAddr.getSizeList(function(error, message) {
        if(error) {
            console.log("Error when getting the size of the list!");
            console.log(error);
        } else {
            //console.log(message);
            var sizeList = message;
            for(var i=lastMessage;i<sizeList;i++) {
                simpleChatAddr.messageList(i, function(error2, chat) {
                    if(error2) {
                        console.log("Error when getting the message");
                        console.log(error2);
                    } else {
                        console.log(chat);
                        addMessageToList(chat, sizeList);
                    }
                });
            }         
        }
    });
}


setInterval(function() {
    getAllMessage();
}, 2000);
