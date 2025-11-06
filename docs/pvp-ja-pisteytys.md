# PvP-vuorovaikutukset ja pisteytys

## H. PvP-vuorovaikutukset

### 1. Myrskymanipulaatio
- Nimi: "Myrskyn voimistaminen"
- Kuvaus: Voimistaa luonnollista myrskyä kohdealueella
- Kustannus: 100€ + 30 TP
- Vaadittu minipeli: Aaltojen ajoitus (90% tarkkuus)
- Cooldown: 120s
- Vaikutus: -50 YP kohteelle
- Puolustus: "Aallonmurtajan vahvistus"
- Puolustusminipeli: Rannikkoviivan piirto
- Puolustuksen tulos: Vähentää vahinkoa 75%

### 2. Sedimenttihyökkäys
- Nimi: "Sedimenttivyöry"
- Kuvaus: Aiheuttaa sedimenttien epätasapainon
- Kustannus: 75€ + 25 TP
- Vaadittu MCQ: Sedimenttikysymys (oikein)
- Cooldown: 90s
- Vaikutus: -30 TP kohteelle
- Puolustus: "Sedimenttipato"
- Puolustusminipeli: Sedimenttien lajittelu
- Puolustuksen tulos: Estää 100% vahingosta

### 3. Vesistön saastutus
- Nimi: "Saastepäästö"
- Kuvaus: Heikentää veden laatua
- Kustannus: 50€ + 40 YP
- Vaadittu minipeli: Roskien lajittelu (100%)
- Cooldown: 150s
- Vaikutus: -2 YP/min (30s ajan)
- Puolustus: "Puhdistusoperaatio"
- Puolustusminipeli: Biodiversiteetin tasapaino
- Puolustuksen tulos: Pysäyttää vaikutuksen

### 4. Infrastruktuurisabotaasi
- Nimi: "Rakenteiden heikentäminen"
- Kuvaus: Vahingoittaa rakennuksia
- Kustannus: 150€
- Vaadittu MCQ: Infrastruktuurikysymys (oikein)
- Cooldown: 180s
- Vaikutus: Poistaa yhden rakennuksen
- Puolustus: "Rakenteellinen vahvistus"
- Puolustusminipeli: Virtausten suuntaus
- Puolustuksen tulos: 50% mahdollisuus estää

## I. Pisteytys ja tasapainotus

### Peruspisteet
- Rakennukset: 50p/kpl
- Tutkimukset: 30p/valmis tutkimus
- Ympäristön tila: 0-400p (skaalautuu YP mukaan)
- Minipelibonus: 0-100p/peli

### Nopeusbonus
- Ensimmäinen rakennus: +25p
- Ensimmäinen tutkimus: +20p
- Nopein puolustus: +15p

### Rangaistukset
- Epäonnistunut hyökkäys: -30p
- Menetetty rakennus: -40p
- Ympäristövahinko: -10p/vahinko

### ELO-ranking
```
uusiELO = vanhaELO + K * (tulos - odotettuTulos)
missä:
K = 32 (perustaso)
tulos = 1 (voitto), 0.5 (tasapeli), 0 (häviö)
odotettuTulos = 1 / (1 + 10^((vastustajan_ELO - oma_ELO)/400))
```

### Tulostaulukko
1. Kokonaispisteet (max 1000)
2. Voitetut pelit
3. Ympäristöpisteet
4. ELO-ranking