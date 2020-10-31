// code saparation
const custSlA = {};
//Dynamically generate a list: helper function
custSlA.createElement = function (element, attribute, inner) {
  if (typeof (element) === "undefined") {
    return false;
  }
  if (typeof (inner) === "undefined") {
    inner = "";
  }
  var el = document.createElement(element);
  if (typeof (attribute) === 'object') {
    for (var key in attribute) {
      el.setAttribute(key, attribute[key]);
    }
  }
  if (!Array.isArray(inner)) {
    inner = [inner];
  }
  for (var k = 0; k < inner.length; k++) {
    if (inner[k].tagName) {
      el.appendChild(inner[k]);
    } else {
      el.appendChild(document.createTextNode(inner[k]));
    }
  }
  return el;
}
//The contents of the folder with images have to be provided on the server-side
//I will assume that we have a string provided via html data-xxx attribute with filenames off images.
// read data attributes
custSlA.readDataParameters = function () {
  const masterContainer = document.querySelector('#slider_param');
  const dir = masterContainer.getAttribute('data-dir');
  const extension = masterContainer.getAttribute('data-extension');
  const filenames = masterContainer.getAttribute('data-filenames');
  const sliderRows = masterContainer.getAttribute('data-slider-rows');
  const imgInRow = masterContainer.getAttribute('data-img-in-row');
  custSlA.arrOposites = masterContainer.getAttribute('data-opposites').split(",");
  custSlA.arrFaster = masterContainer.getAttribute('data-faster').split(",");
  custSlA.arrSlower = masterContainer.getAttribute('data-slower').split(",");
  //number of images * imageWidth have to be greater then .slider width,
  //but slider with will be corrected if it is not case
  const arrayFilenames = filenames.split(",");
  return [dir, extension, filenames, sliderRows, imgInRow, arrayFilenames];
}
custSlA.createSliders = function (dir, extension, filenames, sliderRows, imgInRow, arrayFilenames) {
  /*
  template that will be created
  <div class="slider">
    <ul>
      <li>
        <div class="container">
          <img src="./images/i1.jpg" alt="Image 1" />
          <button class="btn">Button</button>
        </div>
      </li>
      ............
    </ul>
  </div>
  */

  var currDivOuter;
  var currUl;
  var currLi, currInnerDiv, currImgObj, currBntObj;
  custSlA.currentFileIndex = 0;
  custSlA.rowsArray = [];
  for (var ii = 1; ii <= sliderRows; ii++) {
    custSlA.rowsArray.push(ii);
  }
  custSlA.rowsArray.forEach(ind => {
    custSlA.currentColumnInLineIndex = 0;
    currDivOuter = 'div' + ind;
    currUl = 'ul' + ind;
    custSlA[currDivOuter] = custSlA.createElement('div', {
      'id': 'slider' + ind,
      'class': 'slider'
    });
    custSlA[currUl] = custSlA.createElement('ul', {
      'id': currUl
    });

    while (custSlA.currentColumnInLineIndex < imgInRow) {
      if (custSlA.currentFileIndex > (arrayFilenames.length - 1)) {
        custSlA.currentFileIndex = 0 // start again from 0 (from beginning)
        // although the parameters should be set on tahat way that all rows have different files
      }
      currImgObj = 'imgObj_' + ind + '_' + custSlA.currentColumnInLineIndex;
      custSlA[currImgObj] = custSlA.createElement('img', {
        "src": dir + arrayFilenames[custSlA.currentFileIndex] + '.' + extension,
        "alt": "Image " + arrayFilenames[custSlA.currentFileIndex],
      });
      currBtnObj = 'btnObj_' + ind + '_' + custSlA.currentColumnInLineIndex;
      custSlA[currBtnObj] = custSlA.createElement('button', {
        "class": "btn"
      }, "Button");
      currInnerDiv = 'innerDiv_' + ind + '_' + custSlA.currentColumnInLineIndex;
      custSlA[currInnerDiv] = custSlA.createElement('div', {
        "class": "container"
      }, [custSlA[currImgObj], custSlA[currBtnObj]]);
      currLi = 'li_' + ind + '_' + custSlA.currentColumnInLineIndex;
      custSlA[currLi] = custSlA.createElement('li', {
        'id': currLi
      }, custSlA[currInnerDiv]);
      custSlA[currUl].appendChild(custSlA[currLi]);
      custSlA.currentColumnInLineIndex++;
      custSlA.currentFileIndex++;
    }
    custSlA[currDivOuter].appendChild(custSlA[currUl]);
    document.querySelector('body').appendChild(custSlA[currDivOuter]);
  });
}

custSlA.animations = function () {
  custSlA.rowsArray.forEach(element => {
    custSlA['ul' + element] = $('#ul' + element);
    custSlA.opposite = custSlA.arrOposites[element - 1];
    if (custSlA.arrOposites[element - 1] === 'false') {
      custSlA['ul' + element].css({
        left: -210
      });
    } else {
      custSlA['ul' + element].css({
        left: 0
      });
    }

    // function for animation - parameter dur is the duration in milliseconds
    custSlA['anim' + element] = function (dur) {
      // adjust slider width to less than ul width
      let ul_width = 0;
      let no = 0;
      $('#ul' + element).children().each(function () {
        no++;
        ul_width = ul_width + $(this).width();
      });
      ul_width = parseInt(((no - 1) / no) * ul_width);
      if (ul_width > 100 && $('.slider').width() > ul_width) { // only if slider wider than ul
        $('.slider').css({
          width: ul_width
        });
      }
      if (custSlA.arrOposites[element - 1] === 'false') {
        custSlA.animation = {
          left: -210
        };
      } else {
        custSlA.animation = {
          left: 0
        };
      }
      custSlA['ul' + element].animate(custSlA.animation, {
        duration: dur,
        easing: 'linear',
        complete: function () {

          if (custSlA.arrOposites[element - 1] === 'false') {
            //move the first item and put it as last item
            $('#ul' + element + '>li:last').after($('#ul' + element + '>li:first'));
            //set the default item to correct position
            custSlA['ul' + element].css({
              left: 0
            }, dur);
          } else {
            //move the last item and put it as first item
            $('#ul' + element + '>li:first').before($('#ul' + element + '>li:last'));
            //set the default item to correct position
            custSlA['ul' + element].css({
              left: -210
            }, dur);
          }
          custSlA['anim' + element](dur);
        }
      });
    }
    custSlA['anim' + element](parseInt(custSlA.arrFaster[element - 1]));
    custSlA['ul' + element].mouseenter(function () {
      custSlA['ul' + element].stop(true, false);
      custSlA['anim' + element](parseInt(custSlA.arrSlower[element - 1]));
    });
    custSlA['ul' + element].mouseleave(function () {
      custSlA['ul' + element].stop(true, false);
      custSlA['anim' + element](parseInt(custSlA.arrFaster[element - 1]));
    });
    // ul.click(function() {
    //     ul.stop(true, false)
    // });
  });
}
custSlA.createElements = function () {
  const arrVars = custSlA.readDataParameters();
  const dir = arrVars[0];
  const extension = arrVars[1];
  const filenames = arrVars[2];
  const sliderRows = arrVars[3];
  const imgInRow = arrVars[4];
  const arrayFilenames = arrVars[5];
  custSlA.createSliders(dir, extension, filenames, sliderRows, imgInRow, arrayFilenames);
}
custSlA.createElements();
$(document).ready(function () {
  custSlA.animations();
});