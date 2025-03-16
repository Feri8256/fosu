/**
 * Converts the content of an osu file to Javascript object
 * This converter have been made according to the official osu! format specifications: https://osu.ppy.sh/wiki/en/Client/File_formats/Osu_%28file_format%29
 * @param {String} str file content as text
 */
function parseOsu(str) {
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


    

    return out;
}

module.exports = {
    parseOsu
}