import "../css/tw.css";
import Alpine from "alpinejs";
import sequencer from "./sequencer";

window.Alpine = Alpine;

Alpine.data('sequencer', sequencer)

Alpine.start();

