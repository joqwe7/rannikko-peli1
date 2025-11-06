# Tiimien Muodostus ja Tekniset Yksityiskohdat

## E. Automaattinen tiimien muodostus

### Kirjallinen kuvaus
Tiimien muodostus tapahtuu automaattisesti seuraavien kriteerien perusteella:
1. Taitotasot tasapainossa (ELO-pisteet)
2. Roolijakauma (1 kutakin roolia per tiimi)
3. Kaveritoiveet (max 2 kaveria/tiimi)
4. Verkkoyhteyden viive (<100ms samaan tiimiin)

### Pseudokoodi

```python
def muodosta_tiimit(pelaajat):
    # Alusta tiimit
    tiimit = []
    vapaatPelaajat = pelaajat.copy()
    
    while len(vapaatPelaajat) >= 3:
        uusiTiimi = []
        
        # 1. Valitse ankkuripelaaja (korkein ELO)
        ankkuri = max(vapaatPelaajat, key=lambda p: p.elo)
        uusiTiimi.append(ankkuri)
        vapaatPelaajat.remove(ankkuri)
        
        # 2. Lisää kaveri jos toivottu
        if ankkuri.kaveriToive and ankkuri.kaveriToive in vapaatPelaajat:
            uusiTiimi.append(ankkuri.kaveriToive)
            vapaatPelaajat.remove(ankkuri.kaveriToive)
        
        # 3. Täytä puuttuvat roolit
        tarvittavatRoolit = {'Tutkija', 'Ympäristönsuojelija', 'Kehittäjä'} - {p.rooli for p in uusiTiimi}
        
        for rooli in tarvittavatRoolit:
            sopivat = [p for p in vapaatPelaajat if p.rooli == rooli and p.viive < 100]
            if sopivat:
                valittu = min(sopivat, key=lambda p: abs(p.elo - ankkuri.elo))
                uusiTiimi.append(valittu)
                vapaatPelaajat.remove(valittu)
        
        if len(uusiTiimi) == 3:
            tiimit.append(uusiTiimi)
    
    return tiimit

# Käsittele parittomat pelaajat
def kasittele_parittomat(tiimit, vapaatPelaajat):
    if len(vapaatPelaajat) == 1:
        # Lisää yksinäinen pelaaja pienimpään tiimiin
        pienin_tiimi = min(tiimit, key=len)
        pienin_tiimi.append(vapaatPelaajat[0])
    elif len(vapaatPelaajat) == 2:
        # Muodosta vajaa tiimi
        tiimit.append(vapaatPelaajat)
```

### Erikoistapaukset
1. Pariton pelaajamäärä:
   - 1 ylimääräinen: Liitetään olemassaolevaan tiimiin
   - 2 ylimääräistä: Muodostetaan vajaa tiimi
   
2. Opettajan ohitukset:
   - Voi pakottaa tietyt pelaajat samaan/eri tiimeihin
   - Voi säätää tiimien kokoa (2-4)