import { Instruction } from './instruction';
import { InstructionProcessor } from './instruction-processor';

export class InstructionSet {
  public position: number = 0;
  public instructions: Instruction[] = [];
  public instructionProcessor: InstructionProcessor;

  public createAndExecute(id: string, data: string, description: string) {
    const instruction = new Instruction(id, data, description, '');
    this.execute(instruction);
  }

  public executeAllAndBreak(instructions: Instruction[]) {
    this.executeAll(instructions);
    this.setBreak();
  }

  public executeAll(instructions: Instruction[]) {
    for (const item of instructions) {
      this.execute(item);
    }
  }

  public execute(instruction: Instruction) {
    if (this.position < this.instructions.length - 1) {
      if (this.instructions[this.position].id === 'break') this.position++;
      this.instructions.splice(this.position, this.instructions.length - this.position);
    }
    this.instructionProcessor.execute(instruction);
    if (
      this.instructions.length > 0 &&
      this.instructionProcessor.aggregate(instruction, this.instructions[this.instructions.length - 1])
    ) {
      // TODO: check aggregation
    } else {
      this.position = this.instructions.push(instruction) - 1;
    }
  }

  public setBreak() {
    this.createAndExecute('break', '', '');
  }

  public hasUndo(): boolean {
    return this.position > 0;
  }

  public undo() {
    let startPosition = this.position;
    if (this.instructions[this.position].id === 'break' && this.position > 0) startPosition--;
    for (let i = startPosition; i >= 0; i--) {
      const instruction = this.instructions[i];
      this.position = i;
      if (instruction.id === 'break') break;
      else this.instructionProcessor.undo(instruction);
    }
  }

  public undoUncompleted() {
    if (this.instructions.length > 0 && this.instructions[this.position].id !== 'break') {
      this.undo();

      if (this.position < this.instructions.length - 1) {
        if (this.instructions[this.position].id === 'break') this.position++;
        this.instructions.splice(this.position, this.instructions.length - this.position);
        this.position = this.instructions.length - 1;
      }
    }
  }

  public hasRedo(): boolean {
    return this.position < this.instructions.length - 1;
  }

  public redo() {
    let startPosition = this.position;
    if (this.instructions[this.position].id === 'break' && this.position < this.instructions.length - 1)
      startPosition++;
    for (let i = startPosition; i < this.instructions.length; i++) {
      const instruction = this.instructions[i];
      this.position = i;
      if (instruction.id === 'break') break;
      else {
        this.instructionProcessor.preRedo(instruction);
        this.instructionProcessor.execute(instruction);
      }
    }
  }
}
