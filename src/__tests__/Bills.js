/**
 * @jest-environment jsdom
 */

import {screen, waitFor} from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import BillsUI from "../views/BillsUI.js"
import { bills } from "../fixtures/bills.js"
import Bills from "../containers/Bills.js";
import { ROUTES, ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";

import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore)

describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      /* [TU - Add expect] */ 
      const isIconHighlighted = windowIcon.classList.contains("active-icon");
			expect(isIconHighlighted).toBeTruthy();
    })
    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map((a) => a.innerHTML);
				const antiChrono = (a, b) => (a < b ? 1 : -1);
				const datesSorted = [...dates].sort(antiChrono);
				expect(dates).toEqual(datesSorted);
    })
    /* [TU - Make the coverage green] */
    test("Then clicking on the eye icon should open the modal", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = BillsUI({ data: bills });
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

      const eye = screen.getAllByTestId("icon-eye")[0];
			const handleClickIconEye = jest.fn(bill.handleClickIconEye(eye));
      eye.addEventListener("click", handleClickIconEye);
			userEvent.click(eye);
			expect(handleClickIconEye).toHaveBeenCalledTimes(1);

      const modale = document.getElementById("modaleFile");
      expect(modale).toBeTruthy()
      expect(screen.getByText("Justificatif")).toBeTruthy();
			expect(bills[0].fileUrl).toBeTruthy();
    })
    test("Then clicking on the new bill button should open the bill form", () => {
      Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = BillsUI({ data: bills });
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = null;
			const bill = new Bills({
				document,
				onNavigate,
				store,
				localStorage: window.localStorage,
			});

      const newBillBtn = screen.getByTestId("btn-new-bill")
      const handleClickNewBill = jest.fn(() => bill.handleClickNewBill());
			newBillBtn.addEventListener("click", handleClickNewBill);
			userEvent.click(newBillBtn);
			expect(handleClickNewBill).toHaveBeenCalledTimes(1);
			expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
    })
  })
  /* [TI] - Integration test */
  describe("When I navigate to Bills", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
        window,
        "localStorage",
        {value: localStorageMock}
      )
      localStorage.setItem("user", JSON.stringify({ type: "Employee", email: "a@a" }));
      const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.appendChild(root);
			router();
    })
    test("Then bills should be fetched from mock API GET", async () => {
      window.onNavigate(ROUTES_PATH.Bills)
      expect(screen.getAllByText("Billed")).toBeTruthy();
			expect(await waitFor(() => screen.getByText("Mes notes de frais"))).toBeTruthy();
      expect(screen.getAllByText("encore")).toBeTruthy();
    })
    test("Then fails with 404 message if an error occurs", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Error 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Error 404/)
      expect(message).toBeTruthy()
    })
    test("Then fails with 500 message if an error occurs", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Error 500"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Bills)
      await new Promise(process.nextTick);
      const message = screen.getByText(/Error 500/)
      expect(message).toBeTruthy()
    })
  })
})
