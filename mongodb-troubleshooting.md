# MongoDB Connection String Generator

Aktualne problemy z connection string:

## Stary format (nie działa):
```
mongodb://burghardtrecording:YNWxgQJ7YGlJAsvX@ac-dphqptj-shard-00-00.xiqryar.mongodb.net:27017/nordic?replicaSet=atlas-nxq9g0-shard-0&ssl=true&authSource=admin&retryWrites=true&w=majority
```

## Poprawiony format (spróbuj):
```
mongodb+srv://burghardtrecording:YNWxgQJ7YGlJAsvX@cluster0.xiqryar.mongodb.net/nordic?retryWrites=true&w=majority
```

## Inne możliwe formaty:
```
mongodb+srv://burghardtrecording:YNWxgQJ7YGlJAsvX@ac-dphqptj-shard-00-00.xiqryar.mongodb.net/nordic?retryWrites=true&w=majority
```

## Kroki do sprawdzenia w MongoDB Atlas:

1. **Database Access**:
   - Sprawdź czy user `burghardtrecording` istnieje
   - Sprawdź uprawnienia (Database User Privileges)
   - Upewnij się że ma dostęp do bazy `nordic`

2. **Network Access**:
   - Dodaj Current IP Address lub 0.0.0.0/0
   - Sprawdź czy nie ma żadnych ograniczeń

3. **Cluster**:
   - Kliknij "Connect" w swoim klastrze
   - Wybierz "Connect your application"
   - Skopiuj connection string

4. **Database Name**:
   - Sprawdź czy baza `nordic` istnieje
   - Albo zmień na `test` dla testów

## Tymczasowe rozwiązanie - użyj bazy `test`:
```
mongodb+srv://burghardtrecording:YNWxgQJ7YGlJAsvX@cluster0.xiqryar.mongodb.net/test?retryWrites=true&w=majority
```
