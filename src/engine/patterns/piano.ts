import type {
    PianoPattern
} from "./types"


export function togglePianoNote(
    pattern: PianoPattern,
    midi: number,
    startStep: number
): PianoPattern {

    const existingNote =
        pattern.notes.find(
            note =>
                note.midi === midi &&
                note.startStep === startStep
        )


    /*
        Si ya existe una nota
        en esa celda, la borramos.
    */

    if (existingNote) {

        return {
            ...pattern,

            notes:
                pattern.notes.filter(
                    note =>
                        note.id !==
                        existingNote.id
                )
        }
    }


    /*
        Si no existe,
        creamos una nueva.
    */

    return {
        ...pattern,

        notes: [
            ...pattern.notes,

            {
                id:
                    crypto.randomUUID(),

                midi,

                startStep,

                lengthSteps: 1,

                velocity: 100
            }
        ]
    }
}