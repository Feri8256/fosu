function createHitSample(t) {
    let hitSampleTokens = t ? t.split(":") : ["0","0","0","0"];
    return {
        normalSet: parseInt(hitSampleTokens[0] ?? 0),
        additionSet: parseInt(hitSampleTokens[1] ?? 0),
        index: parseInt(hitSampleTokens[2] ?? 0),
        volume: parseInt(hitSampleTokens[3] ?? 0),
        filename: hitSampleTokens[4] ?? "",
    }
}

function createHitSound(t) {
    return Number(t).toString(2).split("").map((n) => { return parseInt(n) });
}

/**
 * Converts the content of an osu file to Javascript object
 * https://osu.ppy.sh/wiki/en/Client/File_formats/Osu_%28file_format%29
 * @param {String} str file content as text
 */
export function parseOsu(str) {
    const colonSeparator = /: */;
    const commaSeparator = /, */;
    const spaceSeparator = / /;

    let out = {
        General: {},
        Editor: {},
        Metadata: {},
        Difficulty: {},
        Events: {},
        TimingPoints: [],
        Colours: {},
        HitObjects: []
    };
    let rows = str.split('\r\n');

    out.General.AudioFilename = rows.find(r => r.startsWith('AudioFilename'))?.split(colonSeparator)[1];
    out.General.AudioLeadIn = parseInt(rows.find(r => r.startsWith('AudioLeadIn'))?.split(colonSeparator)[1] || 0);
    out.General.PreviewTime = parseInt(rows.find(r => r.startsWith('PreviewTime'))?.split(colonSeparator)[1] || -1);
    out.General.Countdown = parseInt(rows.find(r => r.startsWith('Countdown'))?.split(colonSeparator)[1] || 1);
    out.General.SampleSet = rows.find(r => r.startsWith('SampleSet'))?.split(colonSeparator)[1] || 'Normal';
    out.General.StackLeniency = parseInt(rows.find(r => r.startsWith('StackLeniency'))?.split(colonSeparator)[1] || 0.7);
    out.General.Mode = parseInt(rows.find(r => r.startsWith('Mode'))?.split(colonSeparator)[1] || 0);
    out.General.LetterboxInBreaks = parseInt(rows.find(r => r.startsWith('LetterboxInBreaks'))?.split(colonSeparator)[1] || 0);
    out.General.UseSkinSprites = parseInt(rows.find(r => r.startsWith('UseSkinSprites'))?.split(colonSeparator)[1] || 0);
    out.General.OverlayPosition = rows.find(r => r.startsWith('OverlayPosition'))?.split(colonSeparator)[1] || 'NoChange';
    out.General.SkinPreference = rows.find(r => r.startsWith('SkinPreference'))?.split(colonSeparator)[1] || '';
    out.General.EpilepsyWarning = parseInt(rows.find(r => r.startsWith('EpilepsyWarning'))?.split(colonSeparator)[1] || 0);
    out.General.CountdownOffset = parseInt(rows.find(r => r.startsWith('CountdownOffset'))?.split(colonSeparator)[1] || 0);
    out.General.SpecialStyle = parseInt(rows.find(r => r.startsWith('SpecialStyle'))?.split(colonSeparator)[1] || 0);
    out.General.WidescreenStoryboard = parseInt(rows.find(r => r.startsWith('WidescreenStoryboard'))?.split(colonSeparator)[1] || 0);
    out.General.SamplesMatchPlaybackRate = parseInt(rows.find(r => r.startsWith('SamplesMatchPlaybackRate'))?.split(colonSeparator)[1] || 0);

    out.Editor.Bookmarks = rows.find(r => r.startsWith('Bookmarks'))?.split(colonSeparator)[1].split(commaSeparator).map(i => parseInt(i)) || [];
    out.Editor.DistanceSpacing = parseInt(rows.find(r => r.startsWith('DistanceSpacing'))?.split(colonSeparator)[1] || 1);
    out.Editor.BeatDivisor = parseInt(rows.find(r => r.startsWith('BeatDivisor'))?.split(colonSeparator)[1] || 1);
    out.Editor.GridSize = parseInt(rows.find(r => r.startsWith('GridSize'))?.split(colonSeparator)[1] || 1);
    out.Editor.TimelineZoom = parseInt(rows.find(r => r.startsWith('TimelineZoom'))?.split(colonSeparator)[1] || 1);

    out.Metadata.Title = rows.find(r => r.startsWith('Title'))?.split(colonSeparator)[1] || '';
    out.Metadata.TitleUnicode = rows.find(r => r.startsWith('TitleUnicode'))?.split(colonSeparator)[1] || '';
    out.Metadata.Artist = rows.find(r => r.startsWith('Artist'))?.split(colonSeparator)[1] || '';
    out.Metadata.ArtistUnicode = rows.find(r => r.startsWith('ArtistUnicode'))?.split(colonSeparator)[1] || '';
    out.Metadata.Creator = rows.find(r => r.startsWith('Creator'))?.split(colonSeparator)[1] || '';
    out.Metadata.Version = rows.find(r => r.startsWith('Version'))?.split(colonSeparator)[1] || '';
    out.Metadata.Source = rows.find(r => r.startsWith('Source'))?.split(colonSeparator)[1] || '';
    out.Metadata.Tags = rows.find(r => r.startsWith('Tags'))?.split(colonSeparator)[1].split(spaceSeparator) || [];
    out.Metadata.BeatmapID = parseInt(rows.find(r => r.startsWith('BeatmapID'))?.split(colonSeparator)[1] || '-1');
    out.Metadata.BeatmapSetID = parseInt(rows.find(r => r.startsWith('BeatmapSetID'))?.split(colonSeparator)[1] || '-1');

    out.Difficulty.HPDrainRate = parseFloat(rows.find(r => r.startsWith('HPDrainRate'))?.split(colonSeparator)[1] || 1);
    out.Difficulty.CircleSize = parseFloat(rows.find(r => r.startsWith('CircleSize'))?.split(colonSeparator)[1] || 1);
    out.Difficulty.OverallDifficulty = parseFloat(rows.find(r => r.startsWith('OverallDifficulty'))?.split(colonSeparator)[1] || 1);
    out.Difficulty.ApproachRate = parseFloat(rows.find(r => r.startsWith('ApproachRate'))?.split(colonSeparator)[1] || 1);
    out.Difficulty.SliderMultiplier = parseFloat(rows.find(r => r.startsWith('SliderMultiplier'))?.split(colonSeparator)[1] || 1);
    out.Difficulty.SliderTickRate = parseFloat(rows.find(r => r.startsWith('SliderTickRate'))?.split(colonSeparator)[1] || 1);


    // Find the row start and end of the Events section
    let eventLinesStart = rows.findIndex(r => r.startsWith('[Events]'));
    let eventLinesEnd = rows.findIndex((r, i) => r.startsWith('[') && i > eventLinesStart);

    for (let i = eventLinesStart + 1; i < eventLinesEnd; i++) {
        let eventLine = rows[i];
        if (eventLine === '') break;
        if (eventLine.startsWith("//")) continue;

        let eventTokens = eventLine.split(commaSeparator);

        // Only care about the background image for now
        if (eventTokens[0] === "0") out.Events.BackgroundImage = eventTokens[2].replaceAll(`"`, "");
    }


    //Find the row start and end of the TimingPoints section
    let timingPointLinesStart = rows.findIndex(r => r.startsWith('[TimingPoints]'));
    let timingPointLinesEnd = rows.findIndex((r, i) => r.startsWith('[') && i > timingPointLinesStart);

    for (let i = timingPointLinesStart + 1; i < timingPointLinesEnd; i++) {
        let timingPointLine = rows[i];
        if (timingPointLine === '') break;
        let timingPointTokens = timingPointLine.split(commaSeparator);
        let timingPoint = {
            time: parseInt(timingPointTokens[0]),
            beatLength: parseFloat(timingPointTokens[1]),
            meter: parseInt(timingPointTokens[2] || 4),
            sampleSet: parseInt(timingPointTokens[3] || 0),
            sampleIndex: parseInt(timingPointTokens[4] || 0),
            volume: parseInt(timingPointTokens[5] || 1),
            uninherited: parseInt(timingPointTokens[6] || 1),
            effects: parseInt(timingPointTokens[7])
        };
        out.TimingPoints.push(timingPoint);
    }


    // Find the row start and end of the HitObjects section
    let hitObjectLinesStart = rows.findIndex(r => r.startsWith('[HitObjects]'));
    let hitObjectLinesEnd = rows.findIndex((r, i) => r === '' && i > hitObjectLinesStart);

    for (let i = hitObjectLinesStart + 1; i < hitObjectLinesEnd; i++) {
        let hitObjectLine = rows[i];
        if (hitObjectLine === '') break;
        let hitObjectTokens = hitObjectLine.split(commaSeparator);

        let hitObject = {};
        // if the row includes letters B, C, L, P, then it's sure it is a slider
        if (/[BCLP]/.test(hitObjectLine)) {
            let curveTypePoints = hitObjectTokens[5].split('|');
            // 2D array [[x,y]...]
            let curvePointsArray = [];
            for (let j = 1; j < curveTypePoints.length; j++) {
                let XY = curveTypePoints[j];
                curvePointsArray.push(XY.split(':').map(n => parseInt(n)));
            }

            hitObject = {
                x: parseInt(hitObjectTokens[0]),
                y: parseInt(hitObjectTokens[1]),
                time: parseInt(hitObjectTokens[2]),
                type: hitObjectTokens[3].split('').map(b => parseInt(b)),
                hitSound: createHitSound(hitObjectTokens[4]),
                objectParams: hitObjectTokens[5],
                hitSample: createHitSample(hitObjectTokens[10]),
                curveType: curveTypePoints[0],
                curvePoints: curvePointsArray,
                slides: parseInt(hitObjectTokens[6]),
                length: parseInt(hitObjectTokens[7]),
                edgeSounds: [],
                edgeSets: []
            }
        } else {
            hitObject = {
                x: parseInt(hitObjectTokens[0]),
                y: parseInt(hitObjectTokens[1]),
                time: parseInt(hitObjectTokens[2]),
                type: hitObjectTokens[3].split('').map(b => parseInt(b)),
                hitSound: createHitSound(hitObjectTokens[4]),
                objectParams: hitObjectTokens[5],
                hitSample: createHitSample(hitObjectTokens[6]),
            };
        }
        out.HitObjects.push(hitObject);

    }

    return out;
}