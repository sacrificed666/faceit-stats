import type { Locale } from "./locales";
import type { Messages } from "./translate";

type FallbackKey = "error.title" | "error.body" | "error.reference" | "error.retry" | "error.home";

// Texts of the last-resort error page, copied so it never ships a catalog
export const FALLBACK_MESSAGES: Readonly<Record<Locale, Pick<Messages, FallbackKey>>> = {
  en: {
    "error.title": "Something went wrong",
    "error.body":
      "The stats could not be shown right now. Try again in a moment; if it keeps happening, the FACEIT Data API may be down.",
    "error.reference": "Error reference: {digest}",
    "error.retry": "Try again",
    "error.home": "Squad overview",
  },
  uk: {
    "error.title": "Щось пішло не так",
    "error.body":
      "Зараз не вдалося показати статистику. Спробуйте ще раз за мить; якщо це повторюється, можливо, FACEIT Data API недоступний.",
    "error.reference": "Код помилки: {digest}",
    "error.retry": "Спробувати ще раз",
    "error.home": "Огляд скваду",
  },
  cs: {
    "error.title": "Něco se pokazilo",
    "error.body":
      "Statistiky teď nejde zobrazit. Zkuste to za chvíli znovu; pokud se to opakuje, FACEIT Data API možná nefunguje.",
    "error.reference": "Kód chyby: {digest}",
    "error.retry": "Zkusit znovu",
    "error.home": "Přehled týmu",
  },
  de: {
    "error.title": "Etwas ist schiefgelaufen",
    "error.body":
      "Die Statistiken können gerade nicht angezeigt werden. Versuche es gleich noch einmal; passiert es wiederholt, ist die FACEIT Data API vielleicht nicht erreichbar.",
    "error.reference": "Fehlerkennung: {digest}",
    "error.retry": "Erneut versuchen",
    "error.home": "Übersicht der Gruppe",
  },
  es: {
    "error.title": "Algo salió mal",
    "error.body":
      "No se pudieron mostrar las estadísticas ahora mismo. Inténtalo de nuevo en un momento; si sigue pasando, puede que la FACEIT Data API no esté disponible.",
    "error.reference": "Referencia del error: {digest}",
    "error.retry": "Reintentar",
    "error.home": "Resumen del grupo",
  },
  fr: {
    "error.title": "Un problème est survenu",
    "error.body":
      "Les statistiques ne peuvent pas être affichées pour le moment. Réessayez dans un instant ; si le problème persiste, la FACEIT Data API est peut-être indisponible.",
    "error.reference": "Référence de l’erreur : {digest}",
    "error.retry": "Réessayer",
    "error.home": "Aperçu de l’équipe",
  },
  it: {
    "error.title": "Qualcosa è andato storto",
    "error.body":
      "Al momento non è possibile mostrare le statistiche. Riprova tra poco; se continua a succedere, la FACEIT Data API potrebbe non essere disponibile.",
    "error.reference": "Codice dell’errore: {digest}",
    "error.retry": "Riprova",
    "error.home": "Panoramica del gruppo",
  },
  nl: {
    "error.title": "Er ging iets mis",
    "error.body":
      "De statistieken kunnen nu niet worden getoond. Probeer het zo opnieuw; als het blijft gebeuren, is de FACEIT Data API misschien onbereikbaar.",
    "error.reference": "Foutcode: {digest}",
    "error.retry": "Opnieuw proberen",
    "error.home": "Overzicht van de groep",
  },
  pl: {
    "error.title": "Coś poszło nie tak",
    "error.body":
      "Nie udało się teraz pokazać statystyk. Spróbuj ponownie za chwilę; jeśli problem się powtarza, FACEIT Data API może nie działać.",
    "error.reference": "Kod błędu: {digest}",
    "error.retry": "Spróbuj ponownie",
    "error.home": "Przegląd ekipy",
  },
  pt: {
    "error.title": "Algo correu mal",
    "error.body":
      "Não foi possível mostrar as estatísticas agora. Tente novamente daqui a pouco; se continuar a acontecer, a FACEIT Data API pode estar em baixo.",
    "error.reference": "Referência do erro: {digest}",
    "error.retry": "Tentar novamente",
    "error.home": "Resumo da equipa",
  },
};
