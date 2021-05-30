
import { CustomPicker, } from 'react-color';
import { IconButton, Slider, TextField } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { Warning, Colorize} from '@material-ui/icons';
import { useState } from 'react';
import rgb from 'hsv-rgb';
import solve, { floatToFraction, rgb2hsv } from './solve';

const lumaConversionComponents = [0.299, 0.587, 0.114];

function hexToRGB(hex) {
    var aRgbHex = hex.replace('#', '').match(/.{1,2}/g);
    return [
        parseInt(aRgbHex[0], 16),
        parseInt(aRgbHex[1], 16),
        parseInt(aRgbHex[2], 16)
    ];
}

function cssColor(rgb) {
    const [r, g, b] = rgb;
    return `rgb(${r}, ${g}, ${b})`;
}

function rgbToLuma(rgb, c) {
    const [r, g, b] = rgb;
    const [x, y, z] = c;
    return Math.floor(x * r + y * g + z * b);
}

const sliderThumbBoxShadow =
    '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const IOSSlider = withStyles({
    root: {
        marginTop: 0,
        padding: 0,
    },
    thumb: {
        height: 20,
        width: 20,
        backgroundColor: '#fff',
        boxShadow: sliderThumbBoxShadow,
        marginTop: -13,
        marginLeft: -10,
        '&:focus, &:hover, &$active': {
            boxShadow: '0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
            // Reset on touch devices, it doesn't add specificity
            '@media (hover: none)': {
                boxShadow: sliderThumbBoxShadow,
            },
        },
    },
    track: {
        marginTop: -20,
        height: 20,
        opacity: 0,
    },
    rail: {
        marginTop: -20,
        height: 20,
        opacity: 0,
    },
})(Slider);

const ValuedSlider = ({
    background,
    min,
    max,
    value,
    onChange
}) => {
    return <div style={{display: 'flex'}}>
        <div style={{
            overflow: 'visible',
            height: 20,
            boxShadow: 'inset 0 0 6px #999999',
            borderRadius: 6,
            marginTop: 4,
            flexGrow: 1,
            background,
        }}>
            <IOSSlider min={min} max={max} step={1} value={value} onChange={(_, e) => onChange(e)} />
        </div>
        <TextField
            style={{ marginLeft: 20, width: 28}}
            id="outlined-size-small"
            value={value}
            size="small"
            onChange={e => {
                const n = Number(e.target.value);
                if (isNaN(n) || n < 0 || n > 359) {
                    return;
                }
                onChange(n);
            }}
        />
    </div>
}

const Picker = () => {
    const [h, updateH] = useState(359);
    const [s, updateS] = useState(100);
    const [v, updateV] = useState(100);
    const [matchFailed, updateMatchFailed] = useState(false);
    const [colorToMatch, updateColorToMatch] = useState([0, 0, 0]);
    const lumaToMatch = rgbToLuma(colorToMatch, lumaConversionComponents) / 255;

    function onHueSelect(newH) {
        let newS = Math.round(100 * solve(newH, 'x', floatToFraction(v / 100), floatToFraction(lumaToMatch), lumaConversionComponents));
                    
        let saturationOverflow = newS > 100 || newS < 0;

        newS = Math.max(0, newS);
        newS = Math.min(100, newS);

        if (saturationOverflow) {
            let newV = Math.round(100 * solve(newH, floatToFraction(newS / 100), 'x', floatToFraction(lumaToMatch), lumaConversionComponents));
            newV = Math.max(0, newV);
            newV = Math.min(100, newV);
            updateV(newV);
        }

        updateS(newS);
        updateH(newH);
        updateMatchFailed(false);
    }

    function onSaturationSelect(newS) {
        let newV = Math.round(100 * solve(h, floatToFraction(newS / 100), 'x', floatToFraction(lumaToMatch), lumaConversionComponents));
        let valueOverflow = newV > 100 || newV < 0;
        newV = Math.max(0, newV);
        newV = Math.min(100, newV);
        updateS(newS);
        updateV(newV);
        updateMatchFailed(valueOverflow);
    }

    function onValueSelect(newV) {
        let newS = Math.round(100 * solve(h, 'x', floatToFraction(newV / 100) , floatToFraction(lumaToMatch), lumaConversionComponents));
        let satOverflow = newS > 100 || newS < 0;
        newS = Math.max(0, newS);
        newS = Math.min(100, newS);
        updateS(newS);
        updateV(newV);
        updateMatchFailed(satOverflow);
    }

    return <div style={{ margin: 5 }}>
        <div style={{ margin: 5 }}>
            <ValuedSlider
                background="linear-gradient(to right,#000 0%, #fff 100%)"
                min={0} 
                max={100}
                value={Math.round(rgbToLuma(colorToMatch, lumaConversionComponents) / 2.55)}
                onChange={e => updateColorToMatch([2.55 * e, 2.55 * e, 2.55 * e])} />
        </div>
        <div
            style={{
            margin: 5,
            display: 'flex',
        }}>
            <div style={{
                display: 'flex',
                borderRadius: 6,
                boxShadow: matchFailed ? ` 0 0 10px yellow` : undefined,
                overflow: 'hidden',
                flexGrow: 1
            }}>
                <div style={{
                    height: 50,
                    width: '50%',
                    flexGrow: 1,
                    background: cssColor(colorToMatch),
                    boxShadow: 'inset 0 0 2px #999999',
                }}></div>
                <div style={{
                    height: 50,
                    flexGrow: 1,
                    width: '50%',
                    background: cssColor(rgb(h, s, v)),
                    boxShadow: 'inset 0 0 2px #999999',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}>{matchFailed && <Warning style={{ 
                    color: 'yellow',
                }}/>}</div>
            </div>
            <div style={{
                verticalAlign: 'middle',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // marginRight: 4,
                // marginLeft: 2,
                width: 48,
            }}>
                <IconButton
                    size="small"
                    onClick={async () => {
                        const color = await window.getColor()
                        if (color) {
                            const rgb = hexToRGB(color);
                            updateColorToMatch(rgb);
                            const [newH, newS, newV] = rgb2hsv(...rgb)
                            updateH(newH);
                            updateS(newS);
                            updateV(newV);
                        }
                    }
                }
                >
                    <Colorize />
                </IconButton>
            </div>
        </div>
        <div id='picker' style={{ margin: 5 }}>
            <ValuedSlider
                background="linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)"
                min={0} 
                max={359} 
                value={h} 
                onChange={onHueSelect} />
            <ValuedSlider
                background={`linear-gradient(to right, ${cssColor(rgb(h, 0, v))} 0%, ${cssColor(rgb(h, 100, v))} 100%)`}
                min={0} 
                max={100} 
                value={s} 
                onChange={onSaturationSelect} />
            
            <ValuedSlider
                background={`linear-gradient(to right,${cssColor(rgb(h, s, 0))} 0%, ${cssColor(rgb(h, s, 100))} 100%)`}
                min={0} 
                max={100} 
                value={v} 
                onChange={onValueSelect} />
        </div>
    </div>
}

export default CustomPicker(Picker);