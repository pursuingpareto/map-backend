defmodule StorymapWeb.Live.MapComponent do
  use StorymapWeb, :live_component
  alias MapLibre
  alias Storymap.Pins

  @spec render(any()) :: Phoenix.LiveView.Rendered.t()
  def render(assigns) do
    ~H"""
      <div style="width:100%; height: 100vh" id="map" phx-hook="Map" phx-update="ignore" data-id={@id}/>
    """
  end

  def update(assigns, socket) do
    socket = assign(socket, id: socket.id)

    ml =
      MapLibre.new(style: :street)
      |> MapLibre.to_spec()

    pins = Pins.list_pins(assigns.user_id)
    pin_coords = Enum.map(pins, fn pin -> %{id: pin.id, title: pin.title, lat: pin.latitude, lng: pin.longitude, is_owner: pin.is_owner} end)

    socket = push_event(socket, "map:#{socket.id}:init", %{"ml" => ml})
    socket = push_event(socket, "map:#{socket.id}:pins", %{"pins" => pin_coords})
    {:ok, socket}
  end

end
