Det går kanske göra enklare, så att man försöker hitta sista , eller .
Och bara behandla den
Sen tar man bort ALLT som inte är siffor till vänster om den
Får kolla först så att allt bara innehåller siffror , .

Just nu gör den massa kontroller för tusen seperatorer, vilket typ inte behövs
Tänker att jag försöker skriva en egen sån här sen, och kör med dom här testerna på den också

Ehm, så vad gör vi nu då
1. Konfigurera vilken currency man vill översätta till
2. Hämta från något API
3. Cachea currencyn man convertade till


OM det är en symbol, måste vi först översätta till förkortningen. Vart kan man göra det?
Sen kan man använda API:er för att översätta 2 förkortningar


ISO 4217

Riksbanken: https://developer.api.riksbank.se/api-details#api=swea-api&operation=get-crossrates-seriesid1-seriesid2-from 5/min, 1k/dag. har direktkonversion, men då måste man översätta från förkortningen till deras längre ID
FXRates: https://fxratesapi.com/ 1k/månad. har inte direktconversion men det är whatever
??: https://github.com/fawazahmed0/exchange-api

Tests
Symbol before
$123
$ 123
$123,4
$ 123,4
$123.4
$ 123.4

Symbol after
123$
123 $
123,4$
123,4 $
123.4$
123.4 $

ISO Code after
123USD
123 USD
123,4USD

ISO Code before
USD123
USD 123
USD123,4
USD 123,4
123,45 EUR
EUR 123,45

Other currencies
123kr
123 kr
123,0kr
123,0 kr
123.0kr
123.0 kr
123.0 KR

:- symbol
123,45 :-
123,45:-

Double decimals
1,000.1 kr should convert to 1 thousand point 1 kr




identifiera vilken först
sen översätt

Om båda decimalerna finns=> ignorera komma
Om 1 finns, se den dom decimal

The ISO standard does not regulate either the spacing, prefixing or suffixing 

https://www.newbridgefx.com/currency-codes-symbols/


https://hexarate.paikama.co/
https://hexarate.paikama.co/
https://hexarate.paikama.co/

https://www.exchangerate-api.com/docs/free