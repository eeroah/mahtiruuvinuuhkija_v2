## Plan on suomeksi, mutta ohjelmakoodi on englanniksi.

---

Tarkoituksena on luoda sniffer-sovellus node-ruuvitag -paketin avulla.

Käytetään node.js viimeisintä versiota.

Katso old-code.js mitä se on aikaisemmin tehnyt ja ammennetaan tästä 2.0 versio.

Lisäksi sovelluksessa tulisi olla myös seuraavat komponenti:

- Snifferi, eli nuuhkija, joka nuuhkii Ruuvi-laitteiden lähettämiä signaaleja.
- Kevyt http-palvelin, jossa voi konfiguroida seuraavia asioita
  ** HTTP-portti on 8005
  ** Hallintapaneeliin tarvitaan myös autentikointi. Tämä pitää käyttäjän määritellä, oletus on admin:admin.
  ** Vastaanottavan pään osoite ja portti, johon sensoreiden mittaustulokset lähetetään.
  ** API-avaimen, jolla varmistetaan, että vain luotettava pää voi lähettää mittaustuloksia.
  ** Autentikointi on Bearer tokenilla ja se pitää kyetä käyttäjän määrittämään http-palvelussa.
  ** Millä syklillä mittaustulokset lähetetään. Tämän pitää olla käyttäjän määritettävissä. Minimi on 5 minuuttia, maksimi 1 tunti.
  \*\* Kevyt simppeli ja kuitenkin 2026 vuosimallin tyyli ja teema.
  \*\* Vastaanottavan API-pään interface on seuraava:
  interface Measurement {
  mac: string;
  temperature: number;
  pressure: number;
  humidity: number;
  battery: number;
  timestamp?: number; // unix ms — defaults to now
  }
