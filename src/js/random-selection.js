/*persona 1*/
const bransons = [
    {
        id: 1,
        name: "Standard Branson",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111012/Figura_de_arcilla_con_sudadera_y_zapatillas_1_1_pizxhi.png",
        spawnWeight: 48,
        fallProbability: 15
    },
    {
        id: 2,
        name: "Brenda",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111013/Personaje_de_arcilla_con_gorra_rosa_1_1_jfyinj.png",
        spawnWeight: 48,
        fallProbability: 15
    },
    {
        id: 3,
        name: "Branson especial de Halloween",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111055/Diablillo_de_fieltro_con_tridente_1_1_qpxekn.png",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 4,
        name: "Pokebranson",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111012/Figura_de_plastilina_con_disfraz_de_Pikachu_1_1_ng7h8y.png",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 5,
        name: "Nekobranson",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111012/Personaje_gato_de_arcilla_con_campana_1_be5ocv.png",
        spawnWeight: 12,
        fallProbability: 55
    },
    {
        id: 6,
        name: "Branjosé Tomás",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795110994/Torero_Chibi_de_Fieltro_con_Capa_Roja_1_cm0e5z.png",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 7,
        name: "Branson especial de San Valentín",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111011/%C3%81ngel_Cupido_de_fieltro_con_arco_y_flecha_1_jwlecq.png",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 8,
        name: "Brokeback Branson",
        image: "https://res.cloudinary.com/dbtuho5h0/image/upload/v1795111012/Joven_vaquero_de_arcilla_con_estrella_amarilla_1_kbl1di.png",
        spawnWeight: 32,
        fallProbability: 30
    },
    {
        id: 9,
        name: "Branson especial de Navidad",
        image: "https://res.cloudinary.com/da9tytxsu/image/upload/v1794918715/brandonEspecialNavidad_prgkh2.png",
        spawnWeight: 32,
        fallProbability: 30
    }
];


function getBransonById(id) {
    return bransons.find(branson => branson.id === Number(id));
}


function selectRandomBranson() {
    const totalWeight = bransons.reduce((total, branson) => {
        return total + branson.spawnWeight;
    }, 0);

    const random = Math.random() * totalWeight;
    let accumulatedWeight = 0;

    for (const branson of bransons) {
        accumulatedWeight += branson.spawnWeight;

        if (random < accumulatedWeight) {
            return branson;
        }
    }
    return bransons[bransons.length -1];
}


function checkClawSuccess(branson) {
    const random = Math.random() * 100;
    return random >= branson.fallProbability;
}


function generateMachineBransons() {
    const machineBransons = [];

    for (let i = 0; i < 15; i++) {
        const selectedBranson = selectRandomBranson();
        machineBransons.push(selectedBranson);
    }

    return machineBransons;
}


export {
    bransons,
    getBransonById,
    selectRandomBranson,
    checkClawSuccess,
    generateMachineBransons
};