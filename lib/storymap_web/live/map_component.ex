defmodule StorymapWeb.Live.MapComponent do
  use StorymapWeb, :live_component
  alias MapLibre
  alias Storymap.Pins

  @fill_colour "#ffa8db"

  def render(assigns) do
    ~H"""
    <div>
      <.form for={%{}} as={:country} phx-submit="add_country" phx-target={@myself}>
        <input type="text" name="country" style="width: 50%" />
        <button type="submit" phx-target={@myself}>Add country</button>
      </.form>
      <div style="width:100%; height: 500px" id="map" phx-hook="Map" phx-update="ignore" data-id={@id}/>
    </div>
    """
  end

  def update(_assigns, socket) do
    socket = assign(socket, id: socket.id)

    ml =
      MapLibre.new(style: :street)
      |> MapLibre.add_geocode_source("poland", "Poland", :country)
      |> MapLibre.add_layer(
        id: "poland",
        source: "poland",
        type: :fill,
        paint: [fill_color: @fill_colour, fill_opacity: 1]
      )
      |> MapLibre.to_spec()

    pins = Pins.list_pins()
    pin_coords = Enum.map(pins, fn pin -> %{id: pin.id, title: pin.title, lat: pin.latitude, lng: pin.longitude} end)

    socket = push_event(socket, "map:#{socket.id}:init", %{"ml" => ml})
    socket = push_event(socket, "map:#{socket.id}:pins", %{"pins" => pin_coords})
    {:ok, socket}
  end

  def handle_event("add_country", %{"country" => country}, socket) do
    map =
      MapLibre.new()
      |> MapLibre.add_geocode_source(country, country, :country)
      |> MapLibre.add_layer(
        id: country,
        source: country,
        type: :fill,
        paint: [fill_color: @fill_colour, fill_opacity: 1]
      )

    source =
      Map.get(map.spec, "sources")
      |> Map.get(country)

    layer =
      Map.get(map.spec, "layers")
      |> Enum.find(fn layer -> Map.get(layer, "id") == country end)
      |> Map.put("source", source)

    {:noreply, push_event(socket, "map:#{socket.id}:add", %{"layer" => layer})}
  end
end
