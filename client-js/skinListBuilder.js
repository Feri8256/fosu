export function createSkinList(game) {
    fetch("skins.json")
        .then(resp => resp.json())
        .then((d) => {
            d.forEach((s) => {
                const opt = document.createElement("option");
                opt.value = s.src;
                opt.text = s.name;

                if (s.src === game.CONFIG.skin) opt.selected = true;

                game.UI.settings.inputs[2].add(opt);
            });

        })
}