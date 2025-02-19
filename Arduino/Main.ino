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

// Valeur cible pour gagner
const int ValeurCible = 15;

// État du compteur
bool isRunning = true;

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
  // Vérifier si des données sont disponibles sur le port série
  while (Serial.available() > 0) {
    char command = Serial.read();
    if (command == 'R' || command == '\n') {  // Gérer à la fois 'R' et le retour à la ligne
      if (command == 'R') {
        // Réinitialiser le jeu
        isRunning = true;
        Compteur = 0;
        attente = 0;
        digitalWrite(RED_LED_PIN, LOW);
        digitalWrite(GREEN_LED_PIN, LOW);
        Serial.println("Game Reset");  // Confirmation du reset
        click();
        lastDebounceTime = millis();
      }
    }
  }

  // Lire l'état du bouton
  bool buttonState = digitalRead(BUTTON_PIN);

  // Détection du changement d'état pour éviter les rebonds
  if (buttonState == LOW && lastButtonState == HIGH) {
    if (millis() - lastDebounceTime > debounceDelay) {
      click();  // Appeler la fonction click pour basculer l'état du compteur
      lastDebounceTime = millis();
    }
  }

  lastButtonState = buttonState;

  // Rafraîchir l'affichage
  sevseg.refreshDisplay();
  sevseg.setNumber(Compteur, -1);

  // Système pour augmenter le compteur si le compteur est actif
  if (isRunning) {
    attente = attente + 1;
    if (attente == attentemax) {
      attente = 0;
      Compteur = Compteur + 1;
    }
  }
}

void click() {
  // Si le compteur est en marche, on l'arrête et on vérifie le résultat
  if (isRunning) {
    isRunning = false;  // Arrêter le compteur

    // Vérifier si le compteur est égal à la valeur cible
    if (Compteur == ValeurCible) {
      Serial.println("Gagné");
      digitalWrite(GREEN_LED_PIN, HIGH);  // Allumer la LED verte
      digitalWrite(RED_LED_PIN, LOW);     // Éteindre la LED rouge
    } else {
      Serial.println("Perdu");
      digitalWrite(RED_LED_PIN, HIGH);    // Allumer la LED rouge
      digitalWrite(GREEN_LED_PIN, LOW);   // Éteindre la LED verte
    }
  } else {
    // Redémarrer le compteur
    isRunning = true;
    Compteur = 0;       // Réinitialiser le compteur à zéro
    attente = 0;        // Réinitialiser le délai d'attente

    // Éteindre les LEDs au redémarrage
    digitalWrite(RED_LED_PIN, LOW);
    digitalWrite(GREEN_LED_PIN, LOW);
  }
}