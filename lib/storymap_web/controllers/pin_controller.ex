defmodule StorymapWeb.PinController do
  use StorymapWeb, :controller

  alias Storymap.Pins
  alias Storymap.Pins.Pin

  action_fallback StorymapWeb.FallbackController

  def index(conn, _params) do
    pins = Pins.list_pins()
    render(conn, :index, pins: pins)
  end

  def create(conn, %{"pin" => pin_params}) do
    with {:ok, %Pin{} = pin} <- Pins.create_pin(pin_params) do
      conn
      |> put_status(:created)
      |> put_resp_header("location", ~p"/api/pins/#{pin}")
      |> render(:show, pin: pin)
    end
  end

  def show(conn, %{"id" => id}) do
    pin = Pins.get_pin!(id)
    render(conn, :show, pin: pin)
  end

  def update(conn, %{"id" => id, "pin" => pin_params}) do
    pin = Pins.get_pin!(id)

    with {:ok, %Pin{} = pin} <- Pins.update_pin(pin, pin_params) do
      render(conn, :show, pin: pin)
    end
  end

  def delete(conn, %{"id" => id}) do
    pin = Pins.get_pin!(id)

    with {:ok, %Pin{}} <- Pins.delete_pin(pin) do
      send_resp(conn, :no_content, "")
    end
  end
end
