# Template per API Javacript
Questo repository è pensato come un buon punto di partenza per la creazione di **API** in Javascript tramite l'utilizzo di **NodeJS** insieme ad **Express**.
## Disclaimer sulle chiavi segrete
Nel file `.env` fornito in questo template sono presenti delle chiavi segrete di esempio, **non sono chiavi reali**.
### Gestione delle chiavi
Le chiavi **sono da modificare**, inoltre, va poi inserito nel `.gitignore` il file `.env`, attualmente commentato.
## Feature implementate in questo Repository
 - **Access e Refresh Token**, implementazione dei JWT   integrata, inseriti nei Cookie.
 - **Variabili d'ambiente**, utilizzo della libreria `dotenv` per la gestione delle variabili. Come già accennato tutte le variabili presenti sono di esempio e ribadisco, una volta ottenuto il codice del template, aggiungere al file `.gitignore` il file `.env`.
 - **Bcrypt**, per l'hashing delle password.
 - **MySQL2**, per gestire connessioni con un db MySQL, questa configurazione può essere cambiata anche se solitamente uso MySQL quindi così è già implementato
