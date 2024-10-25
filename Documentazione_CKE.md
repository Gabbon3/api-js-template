# Documentazione del Client Key Exchange (CKE)

## Panoramica

Il Client Key Exchange (CKE) è un meccanismo di sicurezza progettato per gestire e memorizzare
in modo sicuro la chiave principale dell'utente, consentendo l'accesso senza richiedere
frequentemente la password. Il sistema CKE si basa su un modello di separazione tra **cookie sicuro HttpOnly**
e **Local Storage** in cui una CKE generata casualmente è memorizzata in un cookie sicuro, mentre la
chiave principale cifrata è memorizzata nel Local Storage del browser.

## Obiettivi

Il sistema CKE serve a:

-   Abilitare l’archiviazione sicura a lungo termine della chiave principale dell'utente, protetta tramite
    una chiave generata casualmente, la CKE.
-   Separare i luoghi di archiviazione delle componenti critiche, proteggendo contro possibili compromissioni dei dati.
-   Offrire una rotazione continua della chiave per aumentare la sicurezza senza compromettere l'usabilità.

## Componenti Principali

1. **Chiave Principale**: La chiave principale derivata dalla password dell'utente, utilizzata per accedere ai dati.
2. **Client Key Exchange (CKE)**: Una chiave generata casualmente, memorizzata come cookie sicuro `HttpOnly`.
   La CKE viene utilizzata per decifrare la chiave principale memorizzata nel Local Storage.
3. **Access Token**: Usato per validare le sessioni utente. Necessario per ottenere la CKE dal backend ad ogni rinnovo di sessione.

## Flusso di Lavoro

### Accesso Iniziale

1. **Login Utente**: L'utente effettua il login con la propria password, da cui si deriva la chiave principale.
2. **Generazione della CKE**: Il backend genera una CKE e la invia nella risposta HTTP come cookie sicuro `HttpOnly`.
3. **Cifratura della Chiave Principale**: Sul lato client, la chiave principale è cifrata con la CKE e memorizzata nel Local Storage.
4. **Memorizzazione della CKE**: La CKE rimane memorizzata nel cookie sicuro, inaccessibile da JavaScript.

### Accessi Successivi

1. **Validazione dell'Access Token**: Il client invia l'access token al backend per la validazione.
2. **Recupero della CKE**: Se l'access token è valido, il backend invia la CKE attuale e ne genera una nuova.
3. **Decifratura della Chiave Principale**: Il client decifra la chiave principale con la CKE recuperata.
4. **Ricifratura della Chiave Principale**: Utilizzando la nuova CKE, il client ricifra la chiave principale e la aggiorna nel Local Storage.
5. **Rotazione della CKE**: La nuova CKE sostituisce quella precedente nel cookie sicuro HttpOnly.

## Considerazioni sulla Sicurezza

### Separazione delle Componenti

La CKE e la chiave principale cifrata sono memorizzate in luoghi separati (cookie HttpOnly e Local Storage),
rendendo difficile l'accesso simultaneo a entrambe le componenti in caso di compromissione.

### Rotazione della Chiave

Ad ogni accesso, la CKE viene aggiornata, assicurando che anche in caso di esposizione una CKE abbia una durata limitata.

### Gestione dell'Access Token

Gli access token vengono periodicamente aggiornati per mantenere la sicurezza delle sessioni e garantire che i token obsoleti siano invalidati.

## Vantaggi

-   **Sicurezza Avanzata**: Il modello di separazione riduce il rischio di violazione dei dati e accesso non autorizzato alla chiave principale.
-   **Convenienza per l'Utente**: Fornisce un'esperienza sicura e senza richiesta della password dopo il login iniziale.
-   **Protezione Continuativa**: La rotazione regolare della CKE e la validazione periodica dell'access token migliorano la sicurezza nel lungo termine.

## Limitazioni

-   La sicurezza dell'accesso basato su CKE dipende dalla robustezza della gestione di sessione e cookie.
-   Il Local Storage, sebbene conveniente, è suscettibile agli attacchi lato client se non gestito in modo sicuro, si potrebbe optare per un sistema di archiviazione migliore come IndexedDB.

## Casi d'Uso del Sistema CKE

Il sistema CKE è particolarmente utile in una serie di casi in cui la sicurezza e la separazione delle chiavi crittografiche sono cruciali. Ecco alcune situazioni specifiche dove l'implementazione del sistema CKE offre particolari vantaggi:

1. **Accesso continuato per applicazioni sensibili**:

    - Applicazioni come password manager, portafogli digitali o piattaforme che gestiscono dati sensibili degli utenti. Il CKE consente agli utenti di accedere senza dover reinserire frequentemente la password, mantenendo comunque una separazione tra i dati di autenticazione e quelli crittografici.

2. **Protezione dei dati in ambienti senza Secure Enclave**:

    - Su dispositivi che non supportano il Secure Enclave, come browser e alcune app desktop, il sistema CKE può sostituire l’enclave per mantenere la sicurezza dei dati cifrati sul dispositivo. Questo è utile per ridurre il rischio di accesso illecito senza dipendere da una componente hardware specifica.

3. **Gestione sicura dei token di sessione**:

    - Per app che richiedono il recupero periodico di una chiave crittografica (ad esempio per sessioni lunghe o accessi offline), il CKE evita la necessità di conservare in locale la password o la chiave principale dell’utente. Al contempo, protegge il token di sessione grazie alla rotazione e gestione periodica della CKE.

4. **Aumento della sicurezza su applicazioni che permettono accessi multi-dispositivo**:

    - Per app che consentono agli utenti di accedere da diversi dispositivi, il CKE offre una soluzione sicura per sincronizzare i dati senza esporre la chiave principale, poiché ogni dispositivo può ottenere la CKE in modo indipendente, purché l’utente sia autenticato.

5. **Impedire l’accesso non autorizzato in caso di compromissione del localStorage**:

    - Se il localStorage del dispositivo viene compromesso, ad esempio da attacchi cross-site scripting (XSS), il CKE rende difficile accedere direttamente ai dati cifrati dell’utente, poiché la chiave per decifrarli non risiede in localStorage, ma richiede un cookie HttpOnly (quindi inaccessibile da script JavaScript).

6. **Applicazioni dove è necessaria la rotazione regolare delle chiavi**:
    - Il CKE può anche essere utilizzato in app che richiedono la rotazione periodica delle chiavi per maggiore sicurezza, come piattaforme di comunicazione sicura, consentendo una rotazione automatica a ogni nuova autenticazione o aggiornamento della sessione.

## Conclusione

Il sistema CKE fornisce una soluzione pratica e sicura per proteggere la chiave principale cifrata
dell'utente in più sessioni, bilanciando sicurezza e praticità per l'utente.
Il suo utilizzo di cookie HttpOnly per la memorizzazione della CKE, combinato con il Local Storage/IndexedDB per i dati cifrati,
risulta efficace nel ridurre i rischi, mantenendo comunque un’esperienza d’uso fluida.