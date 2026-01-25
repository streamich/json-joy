export interface TodosView {
  list: TodoView[];
}

export interface TodoView {
  id: string;
  text: string;
  completed?: boolean;
}
