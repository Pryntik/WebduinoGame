#include "SevSeg.h"

SevSeg sevseg;

// Variables globales
int Compteur = 0;       // Compteur initial
int attente = 0;        // Compteur en attente
int attentemax = 1000;  // Définir la vitesse d'incrémentation

// Broche du bouton (utilisation de A0)
#define BUTTON_PIN A0

// Broches pour les LEDs (utilisation de A1 et A2)
#define RED_LED_PIN A1
#define GREEN_LED_PIN A2

// Pour gérer le rebond du bouton
bool lastButtonState = HIGH;
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;

void setup() {
  byte numDigits = 4;
  byte digitPins[] = {10, 11, 12, 13};
  byte segmentPins[] = {9, 2, 3, 5, 6, 8, 7, 4};

  bool resistorsOnSegments = true;
  bool updateWithDelaysIn = true;
  byte hardwareConfig = COMMON_CATHODE;
  sevseg.begin(hardwareConfig, numDigits, digitPins, segmentPins, resistorsOnSegments);
  sevseg.setBrightness(90);

  // Initialisation du bouton sur A0
  pinMode(BUTTON_PIN, INPUT_PULLUP);

  // Initialisation des LEDs sur A1 et A2
  pinMode(RED_LED_PIN, OUTPUT);
  pinMode(GREEN_LED_PIN, OUTPUT);

  // Éteindre les LEDs au démarrage
  digitalWrite(RED_LED_PIN, LOW);
  digitalWrite(GREEN_LED_PIN, LOW);

  // Initialisation de la communication série
  Serial.begin(9600);
}

void loop() {
  // Lire les données série et mettre à jour le score
  if (Serial.available()) {
    String receivedData = Serial.readStringUntil('\n'); // Lire jusqu'à la fin de ligne

    if (receivedData.startsWith("SCORE:")) {
      int newScore = receivedData.substring(6).toInt(); // Extraire le nombre
      if(Compteur > newScore) {
        digitalWrite(RED_LED_PIN, HIGH);
        digitalWrite(GREEN_LED_PIN, LOW);
      } else if (Compteur < newScore) {
        digitalWrite(RED_LED_PIN, LOW);
        digitalWrite(GREEN_LED_PIN, HIGH);
      }
      Compteur = newScore; // Mettre à jour le score affiché
      Serial.print("Score reçu : ");
      Serial.println(Compteur);
    }
  }

  // Lire l'état du bouton
  bool buttonState = digitalRead(BUTTON_PIN);

  if (buttonState == LOW && lastButtonState == HIGH) {
    if (millis() - lastDebounceTime > debounceDelay) {
      Serial.println("A");  // Envoie "A" via le port Série
      lastDebounceTime = millis();
    }
  }

  lastButtonState = buttonState;

  // Mettre à jour l'affichage 7 segments avec la nouvelle valeur
  sevseg.setNumber(Compteur);
  sevseg.refreshDisplay();
}