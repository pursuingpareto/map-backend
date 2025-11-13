defmodule StorymapWeb.MapController do
  use StorymapWeb, :controller

  alias MapLibre

  def index(conn, _params) do
    render(conn, :map)
  end

  def style(conn, _params) do
    spec =
      MapLibre.new(style: :terrain)
      |> MapLibre.to_spec()
      |> Map.put("projection", %{"type" => "globe"})

    json(conn, spec)
  end
end
