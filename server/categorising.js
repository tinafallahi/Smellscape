// Categories: "TR", "ID", "FD", "SK", "CL", "SY", "WS", "HU", "NT", "CN", "NF", "EM"

var tr = ["car", "bus", "lorry", "tram", "train", "fumes", "traffic", "rubber", "tire", "tyre", "fuel", "gasonline", "petrol"];

var id = ["brewery", "factory", "industry", "chemical", "abbatoir", "sewage", "nail salon", "hair salon", "hairdresser", "dry cleaning", "coal", "solvent"];

var fd = ["vanilla", "fried", "doughnut", "popcorn", "clove", "wine", "blackberry", "lemon", "crepe", "waffle", "fig", "pancake", "caramel", "eggs", "tomato", "food"];

var sk = ["cigarette", "cigar", "smoke", "roll-up", "pipe", "marijuana", "tobacco"];

var cl = ["bleach", "cleaning", "cleansing", "cleaner"]; 

var sy = ["air freshener", "scented candle", "scented product", "medecine", "doctor", "dentist"];

var ws = ["bin", "litter", "public toilet", "urine", "faeces", "excrement", "vomit", "trash", "garbage", "rubbish"];

var hu = ["body", "human", "BO", "body odour", "fart", "flatulance", "smokers", "perfume", "aftershave", "urine", "faeces", "shit", "excrement", "animal", "fur",
"hair", "armpit", "fox", "dog", "cat", "person", "piss", "vomit", "man", "woman", "child", "kid"];

var nt = ["tree", "blossom", "flower", "plant", "fresh air", "soil", "dirt", "mud", "sea", "canal", "river", "waterway", "stream", "grass", "hay", "straw", "leaf", "petal",
"oxygen", "ozone", "rain", "droppings", "jasmine", "guano", "hydraenga", "orchid", "lemon", "blackberry", "cauliflower", "lime", "pine", "juniper", "cypress", "humid", 
"moisture", "stone", "countryside", "fungal", "mushrooms"];

var cn = ["drain", "dust", "plaster", "wood", "metal", "construction", "paint", "varnish", "building"];

var nf = ["cardboard", "leather", "paper", "plastic", "new clothes", "shoes", "incense", "tannin", "lipstick", "metal", "wood"]; 

var em = ["anger", "fear", "sadness", "disgust", "surprise", "anticipation", "trust", "joy"];

module.exports = {
  assignCategory: function (description) {
    var punctuationless = description.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()]/g,"");
    var lowercase = punctuationless.toLowerCase();
    var words = lowercase.split(" ");

    if(words.length >= 3){
      return "CX";
    }

    var count = 0;
    var categories = [];
    for(var i = 0; i < words.length; i++) {
      if(tr.indexOf(words[i]) !== -1) {
        categories.push("TR");
      } else if (id.indexOf(words[i]) !== -1) {
        categories.push("ID");
      } else if (fd.indexOf(words[i]) !== -1) {
        categories.push("FD");
      } else if (sk.indexOf(words[i]) !== -1) {
        categories.push("SK");
      } else if (cl.indexOf(words[i]) !== -1) {
        categories.push("CL");
      } else if (sy.indexOf(words[i]) !== -1) {
        categories.push("SY");
      } else if (ws.indexOf(words[i]) !== -1) {
        categories.push("WS");
      } else if (hu.indexOf(words[i]) !== -1) {
        categories.push("HU");
      } else if (nt.indexOf(words[i]) !== -1) {
        categories.push("NT");
      } else if (cn.indexOf(words[i]) !== -1) {
        categories.push("CN");
      } else if (nf.indexOf(words[i]) !== -1) {
        categories.push("NF");
      } else if (em.indexOf(words[i]) !== -1) {
        categories.push("EM");
      } 
      count ++;
    }

    if(categories.length === 0) {
      return "NA";
    }

    if(categories.length === 1) {
      return categories[0];
    }

    if(categories.length === 2) {
      if(categories[0] === categories[1]) {
        return categories[0];
      } else {
        return "CX";
      }
    }
  }
};