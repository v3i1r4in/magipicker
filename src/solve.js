import { Expression, Fraction, Equation } from 'algebra.js';

export function floatToFraction(f) {
    return new Fraction(Math.floor(f * 10000), 10000);
}

// http://www.javascripter.net/faq/rgb2hsv.htm
export function rgb2hsv(r,g,b) {
    var computedH = 0;
    var computedS = 0;
    var computedV = 0;
   
    //remove spaces from input RGB values, convert to int
    var r = parseInt( (''+r).replace(/\s/g,''),10 ); 
    var g = parseInt( (''+g).replace(/\s/g,''),10 ); 
    var b = parseInt( (''+b).replace(/\s/g,''),10 ); 
   
    if ( r==null || g==null || b==null ||
        isNaN(r) || isNaN(g)|| isNaN(b) ) {
      alert ('Please enter numeric RGB values!');
      return;
    }
    if (r<0 || g<0 || b<0 || r>255 || g>255 || b>255) {
      alert ('RGB values must be in the range 0 to 255.');
      return;
    }
    r=r/255; g=g/255; b=b/255;
    var minRGB = Math.min(r,Math.min(g,b));
    var maxRGB = Math.max(r,Math.max(g,b));
   
    // Black-gray-white
    if (minRGB==maxRGB) {
     computedV = minRGB;
     return [0,0,computedV];
    }
   
    // Colors other than black-gray-white:
    var d = (r==minRGB) ? g-b : ((b==minRGB) ? r-g : b-r);
    var h = (r==minRGB) ? 3 : ((b==minRGB) ? 1 : 5);
    computedH = 60*(h - d/(maxRGB - minRGB));
    computedS = (maxRGB - minRGB)/maxRGB;
    computedV = maxRGB;
    return [Math.round(computedH), Math.round(computedS * 100), Math.round(computedV * 100)];
}

export default function solve(h, s, v, lumaToMatch, lumaConversionComponents) {
    const hh = h / 60;
    const i = Math.floor(hh);
    const ff = hh - i;

    v = new Expression(v);
    s = new Expression(s);

    const p = new Expression(1)
        .subtract(s)
        .multiply(v);
    const q =  new Expression(1)
        .subtract(s.multiply(floatToFraction(ff)))
        .multiply(v);
    const t =  new Expression(1)
        .subtract(s.multiply(floatToFraction(1 - ff)))
        .multiply(v);
    let r,g,b;
    switch(i) {
        case 0:
            r = v;
            g = t;
            b = p;
            break;
        case 1:
            r = q;
            g = v;
            b = p;
            break;
        case 2:
            r = p;
            g = v;
            b = t;
            break;
    
        case 3:
            r = p;
            g = q;
            b = v;
            break;
        case 4:
            r = t;
            g = p;
            b = v;
            break;
        case 5:
        default:
            r = v;
            g = p;
            b = q;
            break;
    }

    const computedLuma = new Expression('x')
        .add(r.multiply(floatToFraction(lumaConversionComponents[0])))
        .add(g.multiply(floatToFraction(lumaConversionComponents[1])))
        .add(b.multiply(floatToFraction(lumaConversionComponents[2])));
    try {
        const frac =  new Equation(computedLuma, new Expression('x').add(lumaToMatch)).solveFor('x');
        return frac.numer / frac.denom;
    } catch (e) {
        if (e.message === 'No Solution') {
            return 0;
        }
    }
}
