/**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom"
import userEvent from '@testing-library/user-event'
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";
import mockStore from "../__mocks__/store.js";

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    test("Then email icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
      await waitFor(() => screen.getByTestId('icon-mail'))
      const windowIcon = screen.getByTestId('icon-mail')
      const isIconHighlighted = windowIcon.classList.contains("active-icon");
			expect(isIconHighlighted).toBeTruthy();
    })
  })
  describe("When I upload a new file", () => {
    test("Then the file name should be displayed if the file format is correct", () => {
      window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
			const store = mockStore;
      const newBill = new NewBill({
				document,
				onNavigate,
				store,
				localStorage,
			});

      const file = new File(['image'], 'image.png', {type: 'image/png'});
      const fileInput = screen.getByTestId("file")
      const handleChangeFile = jest.fn(() => newBill.handleChangeFile)
      fileInput.addEventListener("change", handleChangeFile);     
      userEvent.upload(fileInput, file)
      
      expect(handleChangeFile).toBeCalledTimes(1)
      expect(fileInput.files[0].name).toBe("image.png")
    })
  })
  describe("When I submit a form", () => {
    test("Then handleSubmit function should be called", () => {
      window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			document.body.innerHTML = NewBillUI();
			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};
      const store = mockStore
			const newBill = new NewBill({ document, onNavigate, store, localStorage });

			newBill.isImgFormatValid = true;

			const formNewBill = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn(newBill.handleSubmit);
			formNewBill.addEventListener("submit", handleSubmit);
			fireEvent.submit(formNewBill);
			expect(handleSubmit).toHaveBeenCalledTimes(1);
    })
  })
  /* [TI] - Integration test */
  describe("When I post a new bill from mock API POST", () => {
    test("Then the bill should be added", async () => {
      const postSpy = jest.spyOn(mockStore, "bills")
      const newBill = {
				id: "47qAXb6fIm2zOKkLzMro",
      vat: "80",
      fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
      status: "pending",
      type: "Hôtel et logement",
      commentary: "séminaire billed",
      name: "encore",
      fileName: "preview-facture-free-201801-pdf-1.jpg",
      date: "2004-04-04",
      amount: 400,
      commentAdmin: "ok",
      email: "a@a",
      pct: 20
			};
      const postBills = await mockStore.bills().update(newBill);
			expect(postSpy).toHaveBeenCalledTimes(1);
			expect(postBills).toStrictEqual(newBill);
    })
    test("Then fails with 404 message if an error occurs", async () => {
      const postSpy = jest.spyOn(console, "error");
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("Error 404"))),
				};
        const newBill = new NewBill({ document, onNavigate, store, localStorage });

				const formNewBill = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				formNewBill.addEventListener("submit", handleSubmit);

				fireEvent.submit(formNewBill);
      await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("Error 404"));
    })
    test("Then fails with 500 message if an error occurs", async () => {
      const postSpy = jest.spyOn(console, "error");
        window.localStorage.setItem(
          "user",
          JSON.stringify({
            type: "Employee",
          })
        );
        document.body.innerHTML = NewBillUI();
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.reject(new Error("Error 500"))),
				};
        const newBill = new NewBill({ document, onNavigate, store, localStorage });

				const formNewBill = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
				formNewBill.addEventListener("submit", handleSubmit);

				fireEvent.submit(formNewBill);
      await new Promise(process.nextTick);
				expect(postSpy).toBeCalledWith(new Error("Error 500"));
    })
  })
})
