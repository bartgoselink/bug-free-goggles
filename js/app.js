const main = document.querySelector("#main");
let htmlString = "";
var locations = '';



for (let i = 0; i < sets.length; i++) {

    htmlString += '<div>';
        htmlString += '<h2>' + sets[i].title + i+'</h2>';
        htmlString += '<img src="https://i3.ytimg.com/vi/' + sets[i].embedId + '/mqdefault.jpg" alt="sets[i].title">';
        htmlString += '<p><strong> Artist </strong>' + sets[i].artists[0].name + '</p>';
        htmlString += '<p><strong> Location </strong>' + sets[i].location + ", " + sets[i].country + '</p>';
        htmlString += '<p><strong> ID </strong>' + sets[i].embedId + '</p>';
        htmlString += '<p><strong> Lat / Lon </strong>' + sets[i].latitude + ", " +  sets[i].longitude + '</p>';
        htmlString += '<p> <strong> Description </strong>' + nl2br(sets[i].description)+ '</p>';
        // htmlString += '<img src="https://i3.ytimg.com/vi/' + sets[i].embedId + '/default.jpg" alt="sets[i].title">'
        // htmlString += '<img src="https://i3.ytimg.com/vi/' + sets[i].embedId + '/sddefault.jpg" alt="sets[i].title">'
        // htmlString += '<img src="https://i3.ytimg.com/vi/' + sets[i].embedId + '/hqdefault.jpg" alt="sets[i].title">'
        // htmlString += '<img src="https://i3.ytimg.com/vi/' + sets[i].embedId + '/maxresdefault.jpg" alt="sets[i].title">'
    htmlString += "</div>";
    htmlString += "<hr />";
    
}

main.innerHTML = htmlString;

function nl2br (str, is_xhtml) {   
  var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';    
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ breakTag +'$2');
}