defmodule StorymapWeb.MapController do
  use StorymapWeb, :controller

  alias MapLibre

  def index(conn, _params) do
    render(conn, :map)
  end

  def style(conn, _params) do
    spec =
      MapLibre.new(style: :street)
      |> MapLibre.to_spec()

    json(conn, spec)
  end
end
