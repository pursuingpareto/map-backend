defmodule StorymapWeb.PageController do
  use StorymapWeb, :controller

  def home(conn, _params) do
    render(conn, :home)
  end
end
