import { Instruction } from './instruction';

export interface InstructionProcessor {
  execute(instruction: Instruction);
  undo(instruction: Instruction);
  aggregate(instruction: Instruction, prevInstruction: Instruction): boolean;
  preRedo(instruction: Instruction);
}
